import { Editor, TinyMCE } from 'tinymce';
const UUIDClass = require('uuidjs');
// import { v4 as uuid } from 'uuid';

declare const tinymce: TinyMCE;

export type CallbackEvent = (key: string, value: string) => void;

const setup = (editor: Editor, url: string): void => {
  const settings = editor.settings;

  const fillInTheBlankCallback: CallbackEvent = settings.fill_in_the_blank_callback;

  editor.ui.registry.addButton('fill-in-the-blank-creator', {
    text: 'fill-in-the-blank-creator button',
    onAction: () => {
      const key = UUIDClass.genV4().toString();
      // const key = uuid();
      const blankLetter = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
      let blankUnderline = '';
      const regex = /<([^>]+)>|&nbsp;|\(|\)/ig;
      const result = editor.selection.getContent().replace(regex, '');
      for (let i = 0; i < Math.max(result.length, 2); i++) {
        blankUnderline += blankLetter;
      }

      const content = `<span id="${key}" contentEditable="false"><span id="label"></span>&nbsp;<u>${blankUnderline}</u>&nbsp;<span id="score"></span></span>`;

      editor.selection.setContent(content);

      fillInTheBlankCallback(key, result);
    }
  });
};

export default (): void => {
  tinymce.PluginManager.add('fill-in-the-blank-creator', setup);
};
