import { Editor, TinyMCE } from 'tinymce';
const uuid = require('uuidjs');
// import { v4 as uuid } from 'uuid';

declare const tinymce: TinyMCE;

const getLengthInUtf8 = (value: string) => {
  var m = encodeURIComponent(value).match(/%[89ABab]/g);
  return value.length * 2 + (m ? m.length : 0);
}

const setup = (editor: Editor, url: string): void => {
  const settings = editor.settings;

  const fillInTheBlankCallback = settings.fill_in_the_blank_callback;

  editor.ui.registry.addButton('fill-in-the-blank', {
    text: 'Add Blank',
    onAction: () => {
      const key = uuid.genV4().toString();
      let blankUnderline = '';
      const regex = /<([^>]+)>|&nbsp;|\(|\)/ig;
      const result = editor.selection.getContent().replace(regex, '');
      for (let i = 0; i < Math.max(getLengthInUtf8(result), 25); i++) {
        blankUnderline += '&nbsp;';
      }

      const content = `<span id="${key}" contentEditable="false"><span id="label"></span>&nbsp;<u>${blankUnderline}</u>&nbsp;<span id="score"></span></span>`;

      editor.selection.setContent(content);

      fillInTheBlankCallback && fillInTheBlankCallback(key, result);
    }
  });
};

export default (): void => {
  tinymce.PluginManager.add('fill-in-the-blank', setup);
};
