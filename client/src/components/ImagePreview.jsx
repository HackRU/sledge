import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
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

export default function ImageUpload({file}) {
  const classes = useStyles();

  return (
    <div className={classes.thumbnail} key={file.name}>
      <div>
        <img src={file.preview} className={classes.image} />
      </div>
    </div>
  );
}
