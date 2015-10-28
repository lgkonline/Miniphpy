var resultsPerPage = $("#search").data("results-per-page");
var search = $("#search").data("search");
var orderBy;
var noSearchTermAlreadyShown = false;

function initThumbnails() {
    $(".search-page.active .search-thumbnail-img").each(function () {
        var thisThumbnail = this;
        var thumbnailPath = $(this).data("thumbnail-path");


        var tempThumb = $("<img />").attr("src", thumbnailPath).load(function () {
            if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 1) {
                //$(thisThumbnail).attr("src", rootPath + "images/bsw-logo-32px.png");
                //$(thisThumbnail).hide();
            }
            else {
                if (!$(thisThumbnail).parent().hasClass("search-thumbnail")) {
                    $(thisThumbnail).attr("src", thumbnailPath);
                    $(thisThumbnail).removeClass("thumbnail");
                    $(thisThumbnail).wrap("<a href='javascript:void(0);' data-img='" + thumbnailPath + "' class='thumbnail search-thumbnail'></a>");
                    $(thisThumbnail).parent().imgPreview({
                        imgCSS: { height: 700 },
                        srcAttr: "data-img"
                    });
                }
            }
        });
    });
}

function noSearchTerm() {
    if (noSearchTermAlreadyShown == false) {
        $("#results").empty();
        $("#results").append("<h1>" + getPhrase("Keine Eingabe") + "</h1>");
        $("#manga-searchform-input").select();
    }
    noSearchTermAlreadyShown = true;
}

var dataTypes;

var totalServices = 0;
var totalServicesLoaded = 0;
var allServices = {};

var areThereSelectedSources = false;

function prepareSingleService(sourceUrl, sourceName, sourceNameUnescaped, searchTerm) {
    if (typeof searchTerm == "undefined" || searchTerm == null) {
        searchTerm = null;
    }

    areThereSelectedSources = true;
    totalServices++; // hm

    allServices[sourceName] = {
        "sourceName": sourceName,
        "sourceUrl": sourceUrl,
        "sourceNameUnescaped": sourceNameUnescaped
    };

    $("#results-loading").fadeIn();

    if ((typeof search == "undefined" || search == null || search == "") && (typeof searchTerm == "undefined" || searchTerm == null || searchTerm == "")) {
        // Es wurde nichts eingegeben
        noSearchTerm();
    }
    else {
        loadDataFromSingleSource(sourceUrl, sourceName, $("#search").data("page"), sourceNameUnescaped, searchTerm);
    }
}

function loadDataTypes() {
    $.ajax({
        url: rootPath + "/json/dataTypes.json",
        dataType: "json",
        success: function (json) {

            dataTypes = json;

            if ($.cookie("filterObj")) {
                // Erweiterte Suche
                var filterObj = JSON.parse($.cookie("filterObj"));

                if (typeof mode != "undefined" && mode == "default") {
                    // Bei Standard-Suche soll Anfrage temporär sein
                    $.removeCookie("filterObj");
                }

                $.each(filterObj.sources, function (currFilterObjKey, currFilterObjVal) {
                    prepareSingleService(
                        currFilterObjVal.sourceUrl.replace(/&amp;/g, "&"),
                        currFilterObjVal.name,
                        currFilterObjVal.nameUnescaped,
                        currFilterObjVal.searchTerm
                    );
                });
            }
            else {
                // Normale Suche

                $(".select-source").has(".checkbox-input[checked]").each(function () {
                    prepareSingleService(
                        $(this).find(".checkbox-input").val(),
                        $(this).find(".checkbox-input").data("source-name"),
                        $(this).find(".checkbox-input").data("source-name-unescaped")
                    );
                });
            }
  

            if (areThereSelectedSources === false) {
                $("#results").prepend(
                    "<div class='alert alert-info'>" +
                        "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                            "<span aria-hidden='true'>&times;</span>" +
                        "</button>" +
                        "<p>" +
                            getPhrase("Keine Datenquelle gewählt") +
                        "</p>" +
                    "</div>"
                );
            }
        }
    });
}


function getDataType(url) {
    var urlSplitted = url.split(".");
    var extension = urlSplitted[urlSplitted.length - 1].toLowerCase();
    var dataType = "default";

    $.each(dataTypes, function (key, value) {
        if (value.extensions.indexOf(extension) > -1) {
            dataType = value.id;
        }
    });

    return dataType;
}

function getExtensionByFilename(filename) {
    var filenameSplitted = filename.split(".");
    var retVal = filenameSplitted[filenameSplitted.length - 1].toLowerCase();
    return retVal;
}

var resultObjs = [];
var totalResults = 0;

function make_base_auth(username, password) {
    var tok = username + ":" + password;
    var hash = window.btoa(tok);
    return hash;
}

function loadDataFromSingleSource(sourceUrl, sourceName, page, sourceNameUnescaped, searchTerm, username, password, remember) {
    if (typeof searchTerm == "undefined" || searchTerm == null) {
        searchTerm = search;
    }

    allServices[sourceName].searchTerm = searchTerm;

    if (typeof username == "undefined" || username == null) {
        username = "";
    }
    if (typeof password == "undefined" || password == null) {
        password = "";
    }
    if (typeof remember == "undefined" || remember == null) {
        remember = false;
    }

    $.ajax({
        url: rootPath + "/Proxy/?ServiceUri=" + encodeURIComponent(sourceUrl) + "&searchTerm=" + searchTerm,
        dataType: "xml",
        data: { "remember": remember },
        beforeSend: function (xhr) {
            if (username != "" && password != "") {
                xhr.setRequestHeader("Authorization", make_base_auth(username, password));
            }

            $("#select-source-" + sourceName + " .checkbox-input").after("<img class='small-loader' src='" + rootPath + "/images/small-loading.GIF' alt='Loading'>");
        },
        success: function (data) {
            var json = $.xml2json(data);

            if (!isNaN(json.channel.totalResults)) {
                totalResults += (json.channel.totalResults * 1);

                if ((json.channel.totalResults * 1) > 0) {
                    for (var i = 0; i < json.channel.item.length; i++) {
                        json.channel.item[i].sourceName = sourceName;
                        json.channel.item[i].sourceNameUnescaped = sourceNameUnescaped;
                        json.channel.item[i].position = i + 1;

                        resultObjs.push(json.channel.item[i]);
                    }
                }
            }



            $("#select-source-" + sourceName).find(".small-loader").fadeOut();
            totalServicesLoaded++;

            if (totalServices === totalServicesLoaded) {
                // Alle Services geladen

                $("#results-loading").remove();

                loadData(resultObjs, page);
            }

            initSignOutVisibility();
        },
        error: function (error) {
            console.log(error);

            if (error.status == 401) {
                var alreadyAppeared = false;
                //alert("Sie müssen sich anmelden.");
                $("#auth-modal").modal("show");

                $("#auth-modal-sourceName").text(sourceName);

                if (alreadyAppeared) {
                    $("#auth-modal-alert").removeClass("hidden");
                }

                $("#auth-modal-form").submit(function () {
                    $("#auth-modal").modal("hide");
                    var User = $("#auth-modal-username").val();
                    var Password = $("#auth-modal-password").val();
                    var Remember = $("#auth-modal-remember").is(":checked");

                    loadDataFromSingleSource(sourceUrl, sourceName, page, sourceNameUnescaped, null, User, Password, Remember);

                    alreadyAppeared = true;

                    return false;
                });

                //
            }
            else {
                $("#results").prepend(
                    "<div class='alert alert-danger'>" +
                        "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                            "<span aria-hidden='true'>&times;</span>" +
                        "</button>" +
                        "<p>" +
                            "We couldn't load " + sourceName + " (<a href='" + sourceUrl + "' target='_blank'>" + sourceUrl + "</a>)" +
                        "</p>" +
                    "</div>"
                );
            }
        }
    });
}

function loadData(resultObjs, page) {

    if (resultObjs.length <= 0) {
        $("#results").prepend(
            "<div class='alert alert-info'>" +
                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
                    "<span aria-hidden='true'>&times;</span>" +
                "</button>" +
                "<p>" +
                    getPhrase("Die Suche ergab keine Treffer.") +
                "</p>" +
            "</div>"
        );
    }

    var tabPaneId = "result-pane";
    var json = {};

    $("#" + tabPaneId).blAppear();

    if (orderBy == "DateDESC") {
        resultObjs.sort(function (a, b) {
            return new Date(b.pubDate) - new Date(a.pubDate);
        });
    }
    else if (orderBy == "DateASC") {
        resultObjs.sort(function (a, b) {
            return new Date(a.pubDate) - new Date(b.pubDate);
        });
    }
    else {
        resultObjs.sort(function (a, b) {
            return a.position - b.position;
        });
    }

    var countTotalResults = totalResults;

    var toCount = resultObjs;
    var countResults;
    if (typeof toCount === "undefined") {
        toCount = results;
    }
    if (toCount.totalResults == 0) {
        // Keine Ergebnisse
        countResults = 0;

        $("#" + tabPaneId).append(
            "<div class='alert alert-info'>" +
                "<p><span class='glyphicon bi-information'></span> " + getPhrase("Die Suche ergab keine Treffer.") + "</p>" +
            "</div>"
        );
        $("#" + tabPaneId).find(".loader").hide();
    }
    else {
        countResults = toCount.length;
    }

    var pages;

    if (countTotalResults == 0) {
        pages = 0;
    }
    else {
        pages = toCount.chunk(resultsPerPage);
    }

    if (countTotalResults > countResults) {
        $("#manga-results-count").text(getPhrase("ErgebnisseCapitalize") + " " + countResults + " " + getPhrase("von") + " " + countTotalResults);
    }
    else {
        $("#manga-results-count").text(countResults + " " + getPhrase("Ergebnisse"));
    }

    var firstPageId = "";
    var lastPageId = "";

    for (var p = 0; p < pages.length; p++) {

        var searchPagesNumber = p + 1;
        var searchPagesId = tabPaneId + "-page-" + searchPagesNumber;

        if (searchPagesNumber == 1) {
            firstPageId = searchPagesId;
        }
        else if (searchPagesNumber == pages.length) {
            lastPageId = searchPagesId;
        }

        $("#search-ghost-pagination").append(
            "<li data-page='" + searchPagesNumber + "'><a href='#" + searchPagesId + "' aria-controls='" + searchPagesId + "' data-toggle='tab'>" + searchPagesNumber + "</a></li>"
            );

        // Wenn nur ein Ergebnis, ist das JSON kein Array mehr sondern ein Object. Und deswegen 
        // muss je nachdem eine andere Variable zum Durchlaufen genommen werden.
        var goThrough = pages[p];
        if (Object.prototype.toString.call(goThrough) === "[object Object]") {
            goThrough = pages[p];
        }


        $("#" + tabPaneId + " .results-count").after(
            "<div id='" + searchPagesId + "' class='tab-pane search-page'></div>"
            );

        var item = 0;
        $.each(goThrough, function (key, value) {
            item++;

            var dataType = getDataType(value.title);
            var extension = getExtensionByFilename(value.title);

            if (typeof value.title !== "undefined") {
                var authorHtml = "";

                if (value.author !== "" && value.author !== "undefined" && typeof value.author !== "undefined") {
                    authorHtml = getPhrase("Von") + ": " + value.author;
                }

                $("#" + searchPagesId).append(
                    "<div class='media' id='result-" + item + "'>" +
                        "<div class='media-body clearfix'>" +
                            "<div class='row'>" +
                                "<div class='col-xs-3 search-thumbnail-col'>" +
                                    "<img id='" + searchPagesId + "-thumbnail-" + key + "' class='search-thumbnail-img thumbnail' " +
                                    "data-thumbnail-path='" + rootPath + "/ImageViewer.aspx?path=" + encodeUrl(value.link) + "&fileName=" + value.title + "' " +
                                    "src='" + rootPath + "/images/dataTypes/" + dataType + "/128px.png' alt='Preview'>" +
                                "</div>" +

                                "<div class='col-xs-9'>" +
                                    "<h4 class='media-heading'>" +
                                        '<a class="result-link" href="' + value.link + '">' +
                                            value.title +
                                        "</a>" +
                                    "</h4>" +
                                    "<p>" +
                                        value.description +
                                    "</p>" +
                                    "<p class='text-muted'>" +
                                        getPhrase("Veröffentlicht") + ": " + getDate(value.pubDate) + "<br>" +
                                        getPhrase("Quelle") + ": " + value.sourceName + "<br>" +
                                        authorHtml +
                                    "</p>" +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                    "</div>"
                );
            }
        });
    }


    $("a[href='#" + firstPageId + "']").tab("show");
    $("#results .media").highlight(search);

    if (pages.length <= 1) {
        $("#" + tabPaneId).find(".pagination-area").hide();
    }
    else {
        var startPage = 1;

        // Befindet sich eine gültige Seitenzahl als Hashtag in der URL, wird zu diese Seite als Startseite definiert
        if (window.location.hash) {
            var hashPage = window.location.hash.replace("#", "") * 1;

            if (hashPage >= 1 && hashPage <= pages.length) {
                startPage = hashPage;
            }
        }

        $("#search-pagination").twbsPagination({
            totalPages: pages.length,
            visiblePages: 5,
            onPageClick: function (event, page) {
                // Aktuelle Seite wird als Hashtag in der URL gespeichert
                window.location.hash = page;

                $("#search-ghost-pagination").find("li[data-page='" + page + "']").find("a").tab("show");
            },
            startPage: startPage,
            first: "<span class='glyphicon bi-navigate_left2'></span>",
            prev: "<span class='glyphicon bi-navigate_left'></span>",
            last: "<span class='glyphicon bi-navigate_right2'></span>",
            next: "<span class='glyphicon bi-navigate_right'></span>"
        });
    }

    initThumbnails();
    initTabBlAppear();

    $.event.trigger({
        type: "resultsBuilt",
        message: "Search results of all sources are ready",
        time: new Date(),
        results: resultObjs,
        services: allServices,
        appName: $("html").attr("data-appname")
    });
}



function initTabBlAppear() {
    $("a[data-toggle='tab']").on("shown.bs.tab", function (e) {
        initThumbnails();
    });

}

$(document).ready(function () {
    loadDataTypes();
    initTabBlAppear();

    $("#toggle-manga-results-row-sidebar").click(function () {
        $(this).toggleClass("active");
        $("#manga-results-row-sidebar").toggleClass("hidden-sm hidden-xs");
    });
    $("#results-tabs a:first").tab("show");
});

$(".select-source").each(function () {
    var selectSourceId = $(this).data("data-source");

    $(this).find(".checkbox-input").change(function () {
        if ($(this).is(":checked")) {
            $("#input-" + selectSourceId).remove();
        }
        else {
            $("#form-data-sources").append("<input type='hidden' name='uncheck' id ='input-" + selectSourceId + "' value='" + selectSourceId + "'>");
        }
    });
});

$(".select-order").each(function () {
    if ($(this).find(".radio-input").is(":checked")) {
        orderBy = $(this).find(".radio-input").val();
    }
});