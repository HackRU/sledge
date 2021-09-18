import { makeStyles } from '@material-ui/core/styles';

import ImagePreview from './ImagePreview';

const useStyles = makeStyles((theme) => ({
  previewWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    margin: theme.spacing(1),
  },
  thumbnailContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(1),
  },
  thumbnail: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    width: 300,
    height: 300,
  },
  image: {
    height: '100%',
  },
}));

export default function ImageUpload({ images }) {
  const classes = useStyles();

  return (
    <div className={classes.previewWrapper}>
      <div className={classes.thumbnailContainer}>
        {images.map((image) => (
          <ImagePreview key={image.name} image={image} />
        ))}
      </div>
    </div>
  );
}
