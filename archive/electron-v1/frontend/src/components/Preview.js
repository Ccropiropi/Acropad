import React from 'react';

function Preview({ html }) {
  return (
    <div className="preview-container">
      <div
        className="preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default Preview;
