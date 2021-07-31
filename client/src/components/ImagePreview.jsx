import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  thumbnail: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    width: 300,
    height: 300,
    padding: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  image: {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  },
}));

export default function ImageUpload({ image }) {
  const classes = useStyles();

  return (
    <div className={classes.thumbnail} key={image.name}>
      <div>
        <img src={image.preview} alt={`preview for ${image.name}`} className={classes.image} />
      </div>
    </div>
  );
}
