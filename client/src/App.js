import { CoreProvider } from '@hackru/frontend-core';
import LINKER from './Linker';
import CONFIG from './FrontendCore.config';

const testUser = {
  // event is the JSON passed in with all the parameters.
  // email: u_email, // this field must be here.
  // "role" and the user's ID are the only fields we care about.
  role: {
    hacker: 'True',
    volunteer: 'False',
    judge: 'False',
    sponsor: 'False',
    mentor: 'False',
    organizer: 'False',
    director: 'False',
  },
  // "votes": 0,
  // "password": password, //this is mandatory and will always be hashed.
  // "github": event.get("github", ''),
  // "major": event.get("major", ''),
  // "short_answer": event.get("short_answer", ''),
  // "shirt_size": event.get("shirt_size", ''),
  // "first_name": event.get("first_name", ''),
  // "last_name": event.get("last_name", ''),
  // "dietary_restrictions": event.get("dietary_restrictions", ''),
  // "special_needs": event.get("special_needs", ''),
  // "date_of_birth": event.get("date_of_birth", ''),
  // "school": event.get("school", "Rutgers University"),
  // "grad_year": event.get("grad_year", ''),
  // "gender": event.get("gender", ''),
  // "registration_status": event.get("registration_status", "waitlist" if not is_not_day_of else "unregistered"),
  // "level_of_study": event.get("level_of_study", ""),
  // "mlh": mlh, //we know this, depending on how the function is called.
  // "day_of":{
  //     "checkIn": False
  // }
};

function App() {
  return (
    <CoreProvider
      // logout() is a test value for now, omitting it gives an error
      Store={{
        profile: testUser,
      }}
      Linker={LINKER}
    >
      {CONFIG}
    </CoreProvider>
  );
}

export default App;
