// Adapted from https://react-dropzone.js.org/#section-previews
import { useEffect, useMemo, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import ImageIcon from '@material-ui/icons/Image';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';

import { useDropzone } from 'react-dropzone';

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

/* Thumbnail Styles */
const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
};

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box',
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden',
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%',
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
    onDrop: (acceptedFiles) => {
      setFieldValue('files', acceptedFiles);
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      );
    },
  });

  //   I think its ugly to use both useMemo and useStyles, but I don't know how to make useStyles work with useDropzone
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept],
  );

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img src={file.preview} style={img} />
      </div>
    </div>
  ));

  useEffect(
    () => () => {
      // Revoke the data URIs to avoid memory leaks
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
      <aside style={thumbsContainer}>{thumbs}</aside>
    </div>
  );
}
