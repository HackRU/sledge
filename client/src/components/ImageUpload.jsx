// Adapted from https://react-dropzone.js.org/#section-previews
import { useEffect, useMemo, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import ImageIcon from '@material-ui/icons/Image';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

import { useDropzone } from 'react-dropzone';

import ImagePreviews from './ImagePreviewsContainer';

const useStyles = makeStyles((theme) => ({
  dropzone: {
    textAlign: 'center',
    padding: '20px',
    border: `3px dashed ${theme.palette.grey[500]}`,
    backgroundColor: '#fafafa',
    color: theme.palette.grey[600],
    cursor: 'pointer',
    transition: 'border .24s ease-in-out',
  },
}));

/* Dropzone Styles */
// TODO: Use centralized theme colors
const activeStyle = {
  borderColor: '#2196f3',
};

const acceptStyle = {
  borderColor: '#00e676',
};

const rejectStyle = {
  borderColor: '#ff1744',
};

export default function ImageUpload(props) {
  const classes = useStyles();

  const [files, setFiles] = useState([]);
  const { setFieldValue } = props;

  const {
    baseStyle,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: 'image/*',
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setFieldValue('images', acceptedFiles);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
  });

  // I think its ugly to use both useMemo and useStyles, but I don't know how to make useStyles work with useDropzone.
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept],
  );

  useEffect(
    () => () => {
      // Revoke the data URIs to avoid memory leaks.
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files],
  );

  return (
    <div>
      <div {...getRootProps({ style })} className={classes.dropzone}>
        <input {...getInputProps()} />
        {isDragActive ? <PhotoLibraryIcon /> : <ImageIcon />}
        <p>Drag and drop your images here, or click to select images.</p>
      </div>
      <ImagePreviews files={files} />
    </div>
  );
}
