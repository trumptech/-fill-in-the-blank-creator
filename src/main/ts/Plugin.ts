import { Editor, EditorSettings, TinyMCE } from 'tinymce';
const uuid = require('uuidjs');

declare const tinymce: TinyMCE;
declare const document: any;

interface IAnswerData {
  key: string;
  answer?: string;
  scoreWeight?: number;
}

function getEditorSettings(editor): EditorSettings {
  // equation_editor_config
  let editorSettings = editor.settings.answer_editor_config;

  if (typeof editorSettings === 'undefined') {
    editorSettings = {};
  } else if (typeof editorSettings !== 'object') {
    throw new Error("'answer_editor_config' property must be an object");
  }

  // url
  if (typeof editorSettings.url === 'undefined') {
    editorSettings.url = 'answer_editor/index.html';
  } else if (typeof editorSettings.url !== 'string') {
    throw new Error(
      "'url' property must be a string in answer_editor_config"
    );
  }

  // origin
  if (typeof editorSettings.origin === 'undefined') {
    editorSettings.origin = document.location.origin;
  } else if (typeof editorSettings.origin !== 'string') {
    throw new Error(
      "'origin' property must be a string in answer_editor_config"
    );
  }

  // title
  if (typeof editorSettings.title === 'undefined') {
    editorSettings.title = 'Answer Editor';
  } else if (typeof editorSettings.title !== 'string') {
    throw new Error(
      "'title' property must be a string in answer_editor_config"
    );
  }

  // space_after_content
  if (typeof editorSettings.space_after_content === 'undefined') {
    editorSettings.space_after_content = '&nbsp;';
  } else if (typeof editorSettings.space_after_content !== 'string') {
    throw new Error(
      "'space_after_content' property must be a string in answer_editor_config"
    );
  }

  // btn_cancel_text
  if (typeof editorSettings.btn_cancel_text === 'undefined') {
    editorSettings.btn_cancel_text = 'Cancel';
  } else if (typeof editorSettings.btn_cancel_text !== 'string') {
    throw new Error(
      "'btn_cancel_text' property must be a string in answer_editor_config"
    );
  }

  // btn_ok_text
  if (typeof editorSettings.btn_ok_text === 'undefined') {
    editorSettings.btn_ok_text = 'Insert';
  } else if (typeof editorSettings.btn_ok_text !== 'string') {
    throw new Error(
      "'btn_ok_text' property must be a string in answer_editor_config"
    );
  }

  if (typeof editorSettings.mathlive_config !== 'object' && typeof editorSettings.mathlive_config !== 'undefined') {
    throw new Error(
      "'mathlive_config' property must be a object with config of mathlive, see http://docs.mathlive.io/tutorial-CONFIG.html"
    );
  }

  return editorSettings;
}

const getLengthInUtf8 = (value: string) => {
  const m = encodeURIComponent(value).match(/%[89ABab]/g);
  return value.length * 2 + (m ? m.length : 0);
};

const setup = (editor: Editor, url: string): void => {
  const editorSettings: EditorSettings = getEditorSettings(editor);
  const settings = editor.settings;

  const fillInTheBlankUpdateCallback = settings.fill_in_the_blank_update_callback;

  editor.ui.registry.addButton('fill-in-the-blank', {
    text: 'Add Blank',
    onAction: () => {
      const key = uuid.genV4().toString();
      const regex = /<([^>]+)>|&nbsp;|\(|\)/ig;
      const answer = editor.selection.getContent().replace(regex, '');

      editor.execCommand('answer-update-dialog', true, { key, answer });
    },
  });

  editor.addCommand('answer-update-dialog', (ui: boolean, data: IAnswerData) => {
    let key = data.key;
    let answer = data?.answer || '';
    let scoreWeight = data?.scoreWeight || 0;
    editor.windowManager.openUrl({
      url: editorSettings.url,
      title: editorSettings.title,
      width: 820,
      height: 400,
      buttons: [
        {
          type: 'cancel',
          text: editorSettings.btn_cancel_text,
        },
        {
          type: 'custom',
          text: editorSettings.btn_ok_text,
          primary: true,
        },
      ],
      onAction: () => {
        editor.execCommand('fill-in-the-blank-insert', true, { key, answer, scoreWeight });
        editor.windowManager.close();
      },
      onMessage: (instance, message) => {
        switch (message.mceAction) {
          case 'fill-in-the-blank-update':
            key = message.key;
            answer = message.answer;
            scoreWeight = message.scoreWeight;
            break;
          case 'fill-in-the-blank-mounted':
            sendParams(
              editorSettings,
              data,
            );
            break;
        }
      },
    });
  });

  editor.addCommand('fill-in-the-blank-insert', (ui: boolean, data: IAnswerData) => {
    let blankUnderline = '';
    const regex = /<([^>]+)>|&nbsp;|\(|\)/ig;
    const result = data.answer.replace(regex, '');
    for (let i = 0; i < Math.max(getLengthInUtf8(result), 25); i++) {
      blankUnderline += '&nbsp;';
    }

    const content = `<span class="fill-in-the-blank" data-key="${data.key}" data-answer="${data.answer}" data-scoreweight="${data.scoreWeight}" contentEditable="false"><span id="label"></span>&nbsp;<u>${blankUnderline}</u>&nbsp;<span id="score"></span></span>`;

    editor.selection.setContent(content);

    setOnClickFillInTheBlankContent(editor);

    fillInTheBlankUpdateCallback(data.key, data.answer, data.scoreWeight);
  });

  editor.on('focus', () => {
    setOnClickFillInTheBlankContent(editor);
  });
};

const sendParams = (editorSettings: EditorSettings, data: IAnswerData) => {
  const iframe = document.querySelector("iframe[src='" + editorSettings.url + "']");

  // Send params to Equation Editor iframe
  iframe.contentWindow.postMessage(data, editorSettings.origin);
};

const setOnClickFillInTheBlankContent = (editor: any) => {
  const tinymceDoc = editor.getDoc();
  const fillInTheBlankSpan = tinymceDoc.getElementsByClassName('fill-in-the-blank');

  // Add onclick listener to all equation content
  for (const fillInTheBlankContent of fillInTheBlankSpan) {
    const key = fillInTheBlankContent.getAttribute('data-key');
    const answer = fillInTheBlankContent.getAttribute('data-answer');
    const scoreWeight = fillInTheBlankContent.getAttribute('data-scoreweight');

    fillInTheBlankContent.onclick = (event) => {
      event.stopPropagation();
      const offScreenSelection = tinymceDoc.getElementsByClassName('mce-offscreen-selection')[0];

      offScreenSelection.innerHTML = `${answer} (${scoreWeight})`;
    };

    fillInTheBlankContent.ondblclick = (event) => {
      event.stopPropagation();
      editor.execCommand('answer-update-dialog', true, { key, answer, scoreWeight });
    };
  }

};

export default (): void => {
  tinymce.PluginManager.add('fill-in-the-blank', setup);
};
