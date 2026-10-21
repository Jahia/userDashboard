import {Bold, ClassicEditor, Essentials, Italic, Paragraph, RemoveFormat, Underline} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

/**
 * CKEditor 5 for the profile's "About me", built into its own script so the page loads it only
 * when Jahia's richtext-ckeditor5 module is installed (see editUserDetails.settingsDashboard.jsp);
 * otherwise the page keeps CKEditor 4.
 *
 * The same version as that module (47.6.1), with the same GPL licence key it uses, and a minimal
 * toolbar: text styling only.
 */
window.userDashboardCKEditor5 = {
  create(textarea) {
    return ClassicEditor.create(textarea, {
      licenseKey: 'GPL',
      plugins: [Essentials, Paragraph, Bold, Italic, Underline, RemoveFormat],
      toolbar: ['bold', 'italic', 'underline', '|', 'removeFormat']
    }).then(editor => {
      // The save reads the textarea whenever CKEditor 4 is absent (saveCkEditorChanges, and
      // getEditorValue in App.jsx), so it is kept in step with every change.
      editor.model.document.on('change:data', () => editor.updateSourceElement());
      return editor;
    });
  }
};
