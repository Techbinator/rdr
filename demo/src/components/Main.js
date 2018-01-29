import React, { Component } from 'react';
import moment from 'moment';
import { defaultRanges, Calendar, DateRange } from '../../../lib';
import Section from 'components/Section';

import 'normalize.css';
import 'styles/global'
import styles from 'styles/main';
import '../../../src/styles.scss'

export default class Main extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      'rangePicker' : {},
      'rangePickerMobile' : {},
      'linked' : {},
      'datePicker' : null,
      'datePickerInternational': null,
      'firstDayOfWeek' : null,
      'predefined' : {},
    }
  }

  handleChange(which, payload) {
    this.setState({
      [which] : payload
    });
  }

  render() {
    const {
        rangePicker,
        rangePickerMobile,
        linked,
        datePicker,
        firstDayOfWeek,
        predefined,
        datePickerInternational
    } = this.state;

    const format = 'dddd, D MMMM YYYY';

    return (
      <main className={styles['Main']}>

        <h1 className={styles['Title']}>React-date-range</h1>

        <Section title='Range Picker'>
          <div style={{display: 'block'}}>
            <input
              type='text'
              readOnly
              value={ rangePicker['startDate'] && rangePicker['startDate'].format(format).toString() }
            />
            <input
              type='text'
              readOnly
              value={ rangePicker['endDate'] && rangePicker['endDate'].format(format).toString() }
            />
          </div>

          <DateRange
            startDate='10/11/2018'
            endDate={ () => {
              return '11/12/2018';
            }}
            onInit={ this.handleChange.bind(this, 'rangePicker') }
            onChange={ this.handleChange.bind(this, 'rangePicker') }
            offsetPositive
            linkedCalendars={ true }
            disableDaysBeforeToday={true}
            firstDayOfWeek={1}
            lang="de"
          />
        </Section>
      </main>
    )
  }
}
