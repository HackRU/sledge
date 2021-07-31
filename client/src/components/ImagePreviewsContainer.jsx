import { makeStyles } from '@material-ui/core/styles';

import ImagePreview from "./ImagePreview"

const useStyles = makeStyles((theme) => ({
  thumbnailContainer: {
    display: 'flex',
    flexDirection: 'row',
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

export default function ImageUpload(props) {
  const classes = useStyles();

  return (
    <div className={classes.thumbnailContainer}>
      {props.files.map((file) => (
        <ImagePreview key={file.name} file={file} />
      ))}
    </div>
  );
}
