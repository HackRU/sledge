// what is props validation
export default function Button({name, message}) {
  const showAlert = (amessage) => {
    alert(amessage);
  };

  return (
    <button type="button" onClick={()=>showAlert(message)}>
       {name} says...
    </button>
  );
};
