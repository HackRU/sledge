import {Button} from "@material-ui/core"

export default function SampleButton({name, message}) {
  const showAlert = (amessage) => {
    alert(amessage);
  };

  return (
    <Button color="primary" onClick={()=>showAlert(message)}>
       {name} says...
    </Button>
  );
};
