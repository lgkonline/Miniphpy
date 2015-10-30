![MINIPHPY](https://raw.githubusercontent.com/lgkonline/Miniphpy/master/public/images/logo.png)

## Okay, what is Miniphpy?

Miniphpy is a small tool for web developers to minify JavaScript and CSS files
for their projects.

How you could guess, Miniphpy is a PHP app which runs on your PC.


## Combine your JS files

There are already tools like Koala which let you compile LESS/Sass and also minify CSS and JS files.
But I couldn' find a good way to combine JS files.

And that's why I started Miniphpy.


## Remote and local compression

In Miniphpy you have two optional ways to compress your code: Remote and local compression.

For the remote compression we use the APIs of http://javascript-minifier.com/ and http://cssminifier.com/.
The good thing is, your output file will be much smaller. The disadvantage: the process will take longer.

So if every single bit counts, you should choose the remote compression. 
But if you are impatient, you should use the local way.


## Used sources

* JShrink (https://github.com/tedious/JShrink)
* CssMin (http://code.google.com/p/cssmin/)
* JavaScript Minifier API (http://javascript-minifier.com/)
* CSS Minifier API (http://cssminifier.com/)