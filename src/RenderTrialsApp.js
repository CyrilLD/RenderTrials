/**
 * RenderTrialsApp Module
 * This React application builds a timeline of clinical trials.
 * - Trials should always take up the maximum disponible height
 * - In case of overlap between trials, trials cannot be displayed on top of each other
 * - Overlapping trials must have the same height
 * @module RenderTrialsApp
 * @author Cyrl Laguilhon-Debat
 */

import React, { Component } from 'react';
import moment from 'moment';
import './RenderTrialsApp.css';

const trials = [
  { start: 5, end: 50, title: 'Study of Bendamustine' },
  { start: 55, end: 85, title: 'ASCT With Nivolumab' },
  { start: 70, end: 100, title: 'Study of Stockolm' },
  { start: 90, end: 115, title: 'Bortezomib' }
  /* Longer list with more levels for testing
  { start: 5, end: 18, title: 'First one' },
  { start: 28, end: 46, title: 'Study of Bendamustine1' },
  { start: 21, end: 100, title: 'A long one' },
  { start: 20, end: 49, title: 'Another one' },
  { start: 55, end: 85, title: 'ASCT With Nivolumab' },
  { start: 75, end: 100, title: 'Study of Stockolm' },
  { start: 70, end: 110, title: 'The new drug study' },
  { start: 90, end: 115, title: 'Bortezomib' } */
];

/**
 * Update the timeline
 * @param { Array } props.trials
 * @return element
 */
function RenderClinicalTrials(props) {
  // Store trials while adding an 'id' property to trials for later use, based on the array index.
  let trials = props.trials.map((trial, id) => Object.assign(trial, { id }));

  const flatDates = trials.reduce((res, trial) =>
    res.concat([
      { val: trial.start, id: trial.id, isStart: true },
      { val: trial.end, id: trial.id, isStart: false }
    ])
  , []);
  // Sort all dates (start and stop) with end before starts, then in natural order
  flatDates.sort((val1, val2) => (val1.isStart === true) ? 1 : -1);
  flatDates.sort((val1, val2) => (val1.val > val2.val) ? 1 : -1);

  /**
   * Positionning algorythm
   * On this main forEach we will do some tasks :
   * - Determine the maximum number of overlaping trials in order to divide the height equally
   * - Set a key for the trial in 'trialsOverlapLevel', defining its position in the stacked items
   * - Set a key for the trial in 'trialsOverlapped' in order to determine it's height for maximum height usage.
   */
  let trialsOverlapLevel = [];
  let trialsOverlapped = [];
  let maxOverlap = 0;
  let currOverlap = 0;
  let nextLevels = [];

  flatDates.forEach((date, index, arr) => {
    if (date.isStart === true) {
      currOverlap += 1;
      maxOverlap = Math.max(maxOverlap, currOverlap);

      // If the last date was also a start date, then the previous trial is overlapped by another
      if (arr[index-1] !== undefined && arr[index-1].isStart === true) {
        trialsOverlapped[arr[index-1].id] = true;
      }

      // Pop the next availlable level from nextLevels. If undefined (start of process, then take currOverlap- 1 instead.
      const freeLevel = nextLevels.pop();
      trialsOverlapLevel[date.id] = (freeLevel !== undefined) ?freeLevel :currOverlap-1;
    }
    else {
      currOverlap -= 1;
      // When encounter an end date, push back the level into the pile
      nextLevels.push(trialsOverlapLevel[date.id]);

      // If the last date was an end date, then the current trial is overlapped by another
      if (arr[index-1] !== undefined && arr[index-1].isStart === false) {
        trialsOverlapped[arr[index].id] = true;
      };
    };
  });

  // Assign trialsOverlapLevel and trialsOverlapped values to trials
  trials = trials.map((trial) => Object.assign(trial,
    { overlapLevel: trialsOverlapLevel[trial.id] },
    { overlapped: trialsOverlapped[trial.id] === true }
  ));

  /**
   * Defines some render and dates properties
   */
  const startDate = new moment('2000-01-01');
  // In case of not ordered trials in the source array, we need to find the one with the last end date.
  const maxMonths = trials.reduce((maxEnd, trial) => {
    return Math.max(maxEnd, trial.end);
  }, 0);
  const yearsToDisplay = Math.ceil((maxMonths+1) / 12); // Nb of full years to display
  const renderWidth = window.innerWidth / 100 * 90; // use 90% of available width
  const maxheight = 300;
  const heightMargin = 7;
  const minTrialHeight = maxheight / maxOverlap;
  const pixByMonth = (renderWidth / yearsToDisplay / 12); // Pixels width by month


  /**
   * Map the trials array to produce an array of React elements representing each trials
   * @param { Array } trials Trials to be displayed
   * @returns React element
   */
  const displayTrials = (trials) => trials.map((trial) => {
    // For each Trial, we need to compute its left/top/width/height properties,
    // regarding start/end dates and overlaping informations.
    const left = Math.floor(trial.start * pixByMonth);
    const width = Math.floor((trial.end - trial.start) * pixByMonth);
    const height = (trial.overlapped === true)
      ? minTrialHeight - (2 * heightMargin)
      : (Math.abs(trial.overlapLevel - maxOverlap) * minTrialHeight) - (2 * heightMargin);
    const top = maxheight - height - Math.abs(minTrialHeight * trial.overlapLevel) ;

    return (
      <div className="trial" key={trial.id} style={{ left, top, width, height }}>
        {trial.title}
        <span className="dates">
          {moment(startDate).add(trial.start, 'months').format('MMM YYYY')} to {moment(startDate).add(trial.end, 'months').format('MMM YYYY')}
        </span>
      </div>
    );
  });

  /**
   * Displays the horizontal timeline
   * @returns React element
   */
  const displayTimeline = () => {
    const ticks = [];
    for (var i = 0; i < yearsToDisplay +1; i++) {
      ticks.push(<div key={i} style={{left: i*(renderWidth / yearsToDisplay)}}></div>);
      if (i % 2 === 0) {
        const key = `${i}date`;
        ticks.push(<p key={key} style={{left: (i* renderWidth / yearsToDisplay) - 25}}>
          {startDate.year() + i}
        </p>);
      }
    };

    return (
      <div className="timeline">{ticks}</div>
    );
  };

  // Returns the full "RenderClinicalTrials" component with the trials, and the horizontal timeline.
  return (
    <div className="render" style={{width: renderWidth}}>
      <div className="trialsContainer">
        {displayTrials(trials)}
      </div>
      <div>{displayTimeline()}</div>
    </div>
  );
};

/**
 * Main class of the React application.
 */
class RenderTrialsApp extends Component {
  render() {
    return (
      <div className="RenderTrialsApp">
        <header className="header">
          <h1 className="title">Render clinical trials</h1>
        </header>
        <RenderClinicalTrials trials={trials} />
      </div>
    );
  }
}

export default RenderTrialsApp;
