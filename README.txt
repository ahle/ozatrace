# OzaTrace
This tool is used for tracing user interactions on the editors of Ozalid and sending them into a TBMS as well as visualizing traces.

## Installing on your own server
- Copy the "trace" folder onto your machine
- Insert the following code into <head> tag of every master pages that could be used in the editor.

	<script type="text/javascript" src="trace/jquery.js"></script>
    <script type="text/javascript" src="trace/collector.js"></script>
	<script type="text/javascript" src="trace/d3.v3.js"></script>
    <script type="text/javascript" src="trace/fisheye.js"></script>
    <link href="trace/css/trace.css" rel="stylesheet">
    <script type="text/javascript" src="trace/main.js"></script>

Note: The relative paths of resources (script, css) need to be adapted with the positions of injected pages.

Once you've configured, you can access into the trace module on the navigation menu of the editor.