var appPath = $("html").data("application-path");
var besenUrl = $("html").data("besen-url");
var rootPath = $("html").data("root-path");

function getUrlPar(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

Array.prototype.chunk = function (chunkSize) {
    var array = this;
    return [].concat.apply([], 
        array.map(function(elem, i) {
            return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
        })
    );
};


function encodeUrl(unencoded) {
    return encodeURIComponent(unencoded).replace(/'/g, "%27").replace(/"/g, "%22");
}
function decodeUrl(encoded) {
    return decodeURIComponent(encoded.replace(/\+/g, " "));
}

function getDate(dateString) {
    var date = new Date(dateString);

    if (isNaN(date.getTime())) {
        // invalid
        return dateString;
    }

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    var hours = date.getHours();
    var minutes = date.getMinutes();

    if (day <= 9) {
        day = "0" + day;
    }

    if (month <= 9) {
        month = "0" + month;
    }

    if (hours <= 9) {
        hours = "0" + hours;
    }

    if (minutes <= 9) {
        minutes = "0" + minutes;
    }

    var dateFormat = new Array();
    dateFormat["GER"] = day + "." + month + "." + year + ", " + hours + ":" + minutes;
    dateFormat["ENG"] = year + "-" + month + "-" + day + ", " + hours + ":" + minutes;

    return dateFormat[getLanguage()];
}

$.ajax({
    url: appPath + "/json/fillers.json",
    dataType: "json",
    success: function (fillers) {
        var key = "Operatoren";
        var value = fillers.Operatoren;

        var thisListId = "manga-search-fillers-list-" + key;

        $("#manga-search-fillers tbody").append(
            "<tr>" +
                "<th class='lang'>" + key + "</th>" +
                "<td>" +
                    "<ul id='" + thisListId + "' class='nav nav-pills'>" +
                    "</ul>" +
                "</td>" +
            "</tr>"
            );

        $.each(value, function (key, listItem) {
            $("#" + thisListId).append(
                "<li>" +
                    "<a href='javascript:void(0);' title='" + listItem.tooltip + "' onclick=\"appendToSearchInput('" + listItem.value + "');\" class='lang'>" +
                        listItem.name +
                    "</a>" +
                "</li>"
                );
        });

        //$.each(fillers, function (key, value) {
        //    var thisListId = "manga-search-fillers-list-" + key;

        //    $("#manga-search-fillers tbody").append(
        //        "<tr>" +
        //            "<th class='lang'>" + key + "</th>" +
        //            "<td>" +
        //                "<ul id='" + thisListId + "' class='nav nav-pills'>" +
        //                "</ul>" +
        //            "</td>" +
        //        "</tr>"
        //        );

        //    $.each(value, function (key, listItem) {
        //        $("#" + thisListId).append(
        //            "<li>" +
        //                "<a href='javascript:void(0);' title='" + listItem.tooltip + "' onclick=\"appendToSearchInput('" + listItem.value + "');\" class='lang'>" +
        //                    listItem.name +
        //                "</a>" +
        //            "</li>"
        //            );
        //    });
        //});
        initLangDom();
    },
    error: function () {
        console.log("Something went wrong");
    }
});

appendToSearchInput = function (value) {
    $("#manga-searchform-input").each(function () {
        $(this).val($(this).val() + " " + value + " ");
        $(this).focus();
    });
};

initBtTooltip = function () {
    $(".bt-tooltip").tooltip();
    $(".bt-tooltip-top").tooltip({ placement: "top" });
    $(".bt-tooltip-bottom").tooltip({ placement: "bottom" });
    $(".bt-tooltip-left").tooltip({ placement: "left" });
    $(".bt-tooltip-right").tooltip({ placement: "right" });

    $(".bt-tooltip-lang").each(function () {
        var title = $(this).attr("data-title");
        var titleLang = getPhrase(title);

        $(this).tooltip({
            title: titleLang
        });
    });
};

function initSignOutVisibility() {
    if ($.cookie("Auth")) {
        $("#sign-out-services").show();
    }
    else {
        $("#sign-out-services").hide();
    }
}

$(document).ready(function () {
    initBtTooltip();

    //$("#manga-search-fillers").hide();

    $("#toggle-manga-search-fillers").click(function () {
        $(this).find('span.glyphicon').toggleClass("hide");
        $("#manga-search-fillers").removeClass("hide");
        $("#manga-search-fillers").slideToggle();

        $("#header").toggleClass("blScrollingHead");
    });

    initSignOutVisibility();

    $("#sign-out-services").click(function () {
        $.removeCookie("Auth");
        location.reload();
    });
});

function installSearchEngine() {
    if (window.external && ("AddSearchProvider" in window.external)) {
        // Firefox 2 and IE 7, OpenSearch
        window.external.AddSearchProvider("http://localhost:58529/Download/searchconnector.osdx");
    } else {
        // No search engine support (IE 6, Opera, etc).
        alert("No search engine support");
    }
}