CodeMirror.defineMode("djinko", function(config, parserConfig) {

	return {
		token : function(stream, state) {

			if (stream.match(/\b(http([^\s]+))\b/)) {
				return "link";
			}

			stream.next();

			// stream.skipToEnd();
		}
	};
});
