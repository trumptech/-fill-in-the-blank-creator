import { TinyMCE } from 'tinymce';
import Plugin from '../../main/ts/Plugin';

declare let tinymce: TinyMCE;

Plugin();

tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'code fill-in-the-blank-creator',
  toolbar: 'fill-in-the-blank-creator',
  // fill_in_the_blank_callback: (id, content) => {
  // }
});
