import { TinyMCE } from 'tinymce';
import Plugin from '../../main/ts/Plugin';

declare let tinymce: TinyMCE;

Plugin();

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code fill-in-the-blank',
  toolbar: 'fill-in-the-blank',
  fill_in_the_blank_callback: (id, content, weights) => {
  },
  extended_valid_elements: 'span[class|data-key|data-answer|data-scoreweight|contentEditable|id]',
});
