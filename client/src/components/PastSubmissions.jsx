import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Submission from './Submission';
import data from '../data/submission.json'

// import Table from '@material-ui/core/Table';
// import TableBody from '@material-ui/core/TableBody';
// import TableCell from '@material-ui/core/TableCell';
// import TableContainer from '@material-ui/core/TableContainer';
// import TableHead from '@material-ui/core/TableHead';
// import TableRow from '@material-ui/core/TableRow';
// import Paper from '@material-ui/core/Paper';

// const useStyles = makeStyles({
//   table: {
//     minWidth: 650,
//   },
// });

// function createData(name, season) {
//   return { name, season };
// }

// const rows = [
//   createData('HealthyDiet', 'Spring 2020'),
//   createData('RutgersBus', 'Fall 2020'),
// ];

// export default function PastSubmissions() {
//   const classes = useStyles();

//   return (
//     <TableContainer component={Paper}>
//       <Table className={classes.table} aria-label="simple table">
//         <TableHead>
//           <TableRow>
//             <TableCell>Name of the hack</TableCell>
//             <TableCell align="right">Hackathon season</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {rows.map((row) => (
//             <TableRow key={row.name}>
//               <TableCell component="th" scope="row">
//                 {row.name}
//               </TableCell>
//               <TableCell align="right">{row.season}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// }

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function SimpleAccordion() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {/* 
        - Use a fetch API to get stuff from BO object (since BO object is exporting the CSV file)
        - But Idk which route to get it from ... 
        - Or maybe in the getSubmissions method in router we can add in that CSV file
        OR


        Use a fetch API from submissions (prolly wont work)
         useEffect(() => {
          const fetchHacks = async () => {
              const response = await fetch('/api/workouts')
              const json = await response.json()

              if (response.ok) {
                setWorkouts(json)
              }
            }

            fetchWorkouts()
          }, [])

      */}
      <Submission value={data} />
      <Submission value={data}/>
    </div>
  );
}
