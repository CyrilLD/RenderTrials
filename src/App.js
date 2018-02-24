import React, { Component } from 'react';
import moment from 'moment';
import './App.css';

const trials = [

  // { start: 14, end: 120, title: 'Study of Bendamustine 2' },
  // { start: 12, end: 20, title: 'Study of Bendamustine 1' },
  { start: 5, end: 50, title: 'Study of Bendamustine' },
  { start: 55, end: 85, title: 'ASCT With Nivolumab' },
  { start: 70, end: 100, title: 'Study of Stockolm' },
  { start: 90, end: 115, title: 'Bortezomib' },
];

/**
 * Update the timeline
 * @param { Array } props.trials
 * @return element
 */
function RenderClinicalTrials(props) {
  // Store trials while adding an 'id' property to trials for later use, based on the array index.
  let trials = props.trials.map((trial, id) => Object.assign(trial, { id }));
  console.log(trials);

  const startDate = new moment('2000-01-01');
  // In case of not ordered trials in the source array, we need to find the one with the last end date.
  const maxMonths = trials.reduce((maxEnd, trial) => {
    return Math.max(maxEnd, trial.end);
  }, 0);
  console.log('maxMonths', maxMonths);

  const renderWidth = window.innerWidth / 100 * 90;
  //const maxDate = moment(startDate.add(maxMonths, 'months'));

  // Number of full years to display (above maximum end date)
  const yearsToDisplay = Math.ceil(maxMonths / 12);
  console.log(yearsToDisplay);



  const flatDates = trials.reduce((res, trial) =>
    res.concat([
      { val: trial.start, id: trial.id, isStart: true },
      { val: trial.end, id: trial.id, isStart: false }
    ])
  , []);
  // Sort all dates (start and stop) in natural order
  flatDates.sort((val1, val2) => (val1.val > val2.val) ? 1 : -1);
  console.log(flatDates);

  // On this main forEach we will do some tasks :
  // - Determine the maximum number of overlaping trials in order to divide the height equally
  // - Set for all trials a new 'overlapPosition' property, defining its position in the stacked items
  // - Set for all trials a new 'isOverlapped' property in order to determine it's height for maximum height usage.
  let trialsOverlapLevel = [];
  let trialsOverlapped = [];

  let maxOverlap = 0;
  let currOverlap = 0;
  let lastEndLevel = 0;
  flatDates.forEach((date, index, arr) => {
    if (date.isStart === true) {
      currOverlap += 1;
      maxOverlap = Math.max(maxOverlap, currOverlap);

      // If the last date was also a start date, then the current trial is covered by another
      if (arr[index-1] !== undefined && arr[index-1].isStart === true) {
        trialsOverlapped[arr[index-1].id] = true;
      }
    }
    else {
      currOverlap -= 1;

      // If the last date was an end date, then the current trial is covered by another
      if (arr[index-1] !== undefined && arr[index-1].isStart === false) {
        //console.log("Overlapped id ", arr[index].id);
        trialsOverlapped[arr[index].id] = true;
        // In case of two consecutives end dates, we take the current decreased level as Trial display level
        trialsOverlapLevel[arr[index].id] = currOverlap;
      }
      else {
        // Else, we take the level of the last end date
        trialsOverlapLevel[arr[index].id] = lastEndLevel;
      }

      // Store the lastEndLevel in order to determine the trial level in next iterations
      lastEndLevel = currOverlap;
    }
    // console.log(date, currOverlap, maxOverlap);
  });

  // TODO : parses trials to find out overlep levels
  // Apply trialsOverlapLevel values to trials
  trials = trials.map((trial) => Object.assign(trial,
    { overlapLevel: trialsOverlapLevel[trial.id] })
  );

  // Apply trialsOverlapped values to trials
  trials = trials.map((trial) => Object.assign(trial,
    { overlapped: trialsOverlapped[trial.id] === true })
  );


  console.log(trials);



  /*
   * Defines some render properties
   */
  const maxheight = 300;
  const minTrialHeight = maxheight / maxOverlap;
  const pixByMonth = (renderWidth / yearsToDisplay / 12);   // Pixels width by month

  // Map the trials array to produce an array of React elements representing each trials
  const displayedTrials = trials.map((trial) => {
    // For each Trial, we need to compute its left/top/width/height properties,
    // regarding start/end dates and overlaping informations.
    const trialLeftPos = Math.floor(trial.start * pixByMonth);
    const trialWidth = Math.floor((trial.end - trial.start) * pixByMonth);
    const trialHeight = (trial.overlapped === true)
      ? minTrialHeight - 14
      : (Math.abs(trial.overlapLevel - maxOverlap) * minTrialHeight) - 14;
    const topPos = maxheight - trialHeight - Math.abs(minTrialHeight * trial.overlapLevel) ;

    return (
      <div className="trial" style={{
        left: trialLeftPos,
        top: topPos,
        width: trialWidth,
        height: trialHeight}}>
        {trial.title}
        <span className="dates">
          {moment(startDate).add(trial.start, 'months').format('MMM YYYY')} to {moment(startDate).add(trial.end, 'months').format('MMM YYYY')}
        </span>
      </div>
    )
  });

  /*
   * Defines some render properties
   */
  const displayTimeline = () => {
    const ticks = [];
    for (var i = 0; i < yearsToDisplay +1; i++) {
      ticks.push(<div style={{left: i*(renderWidth / yearsToDisplay)}}></div>);
      if (i % 5 === 0) {
        ticks.push(<p style={{left: (i* renderWidth / yearsToDisplay) - 25}}>
          {startDate.year() + i}
        </p>);
      }
    };

    return (
      <div className="timeline">{ticks}</div>
    );
  }

  return (
    <div className="render" style={{width: renderWidth}}>
      <div className="trialsContainer">
        {displayedTrials}
      </div>
      <div>{displayTimeline()}</div>
    </div>
  )
}


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Render clinical trials</h1>
        </header>
        <RenderClinicalTrials trials={trials} />
      </div>
    );
  }
}

export default App;
