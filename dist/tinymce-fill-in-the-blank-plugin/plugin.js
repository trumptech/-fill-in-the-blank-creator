!function(){"use strict";var c=require("uuidjs"),o=function(n){var t=encodeURIComponent(n).match(/%[89ABab]/g);return 2*n.length+(t?t.length:0)};tinymce.PluginManager.add("fill-in-the-blank",function(l,n){var s=l.settings.fill_in_the_blank_callback;l.ui.registry.addButton("fill-in-the-blank",{text:"Add Blank",onAction:function(){for(var n=c.genV4().toString(),t="",e=l.selection.getContent().replace(/<([^>]+)>|&nbsp;|\(|\)/gi,""),a=0;a<Math.max(o(e),25);a++)t+="&nbsp;";var i='<span id="'.concat(n,'" contentEditable="false"><span id="label"></span>&nbsp;<u>').concat(t,'</u>&nbsp;<span id="score"></span></span>');l.selection.setContent(i),s&&s(n,e)}})})}();