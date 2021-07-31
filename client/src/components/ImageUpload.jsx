// Adapted from https://react-dropzone.js.org/#section-previews
import { useEffect, useMemo, useState } from 'react';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import ImageIcon from '@material-ui/icons/Image';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import ClearIcon from '@material-ui/icons/Clear';

import { useDropzone } from 'react-dropzone';

import ImagePreviews from './ImagePreviewsContainer';

const useStyles = makeStyles((theme) => ({
    imageUploadFieldContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
  dropzone: {
    textAlign: 'center',
    padding: '20px',
    border: `3px dashed ${theme.palette.grey[500]}`,
    borderRadius: '7px',
    backgroundColor: '#fafafa',
    color: theme.palette.grey[600],
    cursor: 'pointer',
    transition: 'border .24s ease-in-out',
  },
  clearImageButton: {
      display: 'flex',
      marginTop: theme.spacing(1),
  }
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

  const [images, setImages] = useState([]);
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
      // Add images to Formik.
      setFieldValue('images', acceptedFiles);

      // Add images to state to show in the preview.
      setImages(
        acceptedFiles.map((image) =>
          Object.assign(image, {
            preview: URL.createObjectURL(image),
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
    [baseStyle, isDragActive, isDragReject, isDragAccept],
  );

  useEffect(
    () => () => {
      // Revoke the data URIs to avoid memory leaks.
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    },
    [images],
  );

  return (
    <div className={classes.imageUploadFieldContainer}>
        {/* eslint-disable react/jsx-props-no-spreading */}
      <div {...getRootProps({ style })} className={classes.dropzone}>
        <input {...getInputProps()} />
        {images.length === 0 ? (
          <div>
            {isDragActive ? <PhotoLibraryIcon /> : <ImageIcon />}
            <p>
              Drag and drop your images here, or click to select images. Upload
              all your images at once, as each new upload overwrites the
              previous one.
            </p>
          </div>
        ) : (
          <ImagePreviews images={images} />
        )}
      </div>
      <div>
        {images.length > 0 ? (
            <div className={classes.clearImageButton}>
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            startIcon={<ClearIcon />}
            onClick={() => {
              setFieldValue('images', []);
              setImages([]);
            }}
          >
            Clear Images
          </Button></div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
