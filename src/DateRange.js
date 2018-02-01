import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parseInput from './utils/parseInput.js';
import Calendar from './Calendar.js';
import PredefinedRanges from './PredefinedRanges.js';
import getTheme, { defaultClasses } from './styles.js';
import moment from 'moment';

class DateRange extends Component {

  constructor(props, context) {
    super(props, context);

    const { format, linkedCalendars, calendars } = props;

    const startDate = parseInput(props.startDate, format, 'startOf');
    const endDate   = parseInput(props.endDate, format, 'endOf');

    this.state = {
      range     : { startDate, endDate },
      link      : linkedCalendars && endDate
    }

    this.step = 0;
  }

  componentDidMount() {
    const { onInit } = this.props;
    onInit && onInit(this.state.range);
  }

  orderRange(range) {
    const { startDate, endDate } = range;
    const swap = startDate.isAfter(endDate);

    if (!swap) return range;

    return {
      startDate : endDate,
      endDate   : startDate
    }
  }

  setRange(range, source, triggerChange) {
    const { onChange } = this.props
    range = this.orderRange(range);

    this.setState({ range }, () => triggerChange && onChange && onChange(range, source));
  }

  handleSelect(date, source) {
    if (date.startDate && date.endDate) {
      this.step = 0;
      return this.setRange(date, source, true);
    }

    const { startDate, endDate } = this.state.range;

    const range = {
      startDate : startDate,
      endDate   : endDate
    };

    switch (this.step) {
      case 0:
        range['startDate'] = date;
        range['endDate'] = date;
        this.step = 1;
        break;

      case 1:
        range['endDate'] = date;
        this.step = 0;
        break;
    }

    const triggerChange = !this.props.twoStepChange || this.step === 0 && this.props.twoStepChange;

    this.setRange(range, source, triggerChange);
  }

  handleLinkChange(direction) {
    const { link } = this.state;

    this.setState({
      link : link.clone().add(direction, 'months')
    });
  }

  componentWillReceiveProps(newProps) {
    // Whenever date props changes, update state with parsed variant
    if (newProps.startDate || newProps.endDate) {
      const format       = newProps.format || this.props.format;
      const startDate    = newProps.startDate   && parseInput(newProps.startDate, format, 'startOf');
      const endDate      = newProps.endDate     && parseInput(newProps.endDate, format, 'endOf');
      const oldStartDate = this.props.startDate && parseInput(this.props.startDate, format, 'startOf');
      const oldEndDate   = this.props.endDate   && parseInput(this.props.endDate, format, 'endOf');

      if (!startDate.isSame(oldStartDate) || !endDate.isSame(oldEndDate)) {
        this.setRange({
          startDate: startDate || oldStartDate,
          endDate: endDate || oldEndDate
        });
      }
    }
  }

  rangeSelected(){
    const { startDate, endDate } = this.state.range;
    return !startDate.isSame(endDate);
  }

  renderHeader() {
    const { startDate, endDate } = this.state.range;
    let text = this.props.headerText;
    let classNames = 'rdr-header';
    if(this.rangeSelected()){
      text = `${moment(startDate).format('dd., DD.MM.YY')} - ${moment(endDate).format('dd., DD.MM.YY')}`;
      classNames += ' rdr-selected-header';
    }
    return (
      <div className={classNames}>
        {text}
      </div>
    );
  }

  renderFooter(){
    if(!this.rangeSelected()){
      return null;
    }
    return (
      <div className='rdr-footer'>
        {this.props.footerButton()}
      </div>
    );
  }

  render() {
    const { ranges, format, theme, linkedCalendars, style, calendars, firstDayOfWeek, minDate, maxDate, classNames, onlyClasses, specialDays, lang, disableDaysBeforeToday, offsetPositive, shownDate, showMonthArrow, rangedCalendars, passiveDays } = this.props;
    const { range, link } = this.state;

    const styles = getTheme(theme);

    const classes = { ...defaultClasses, ...classNames };
    const yearsDiff = range.endDate.year() - range.startDate.year();
    const monthsDiff = range.endDate.month() - range.startDate.month();
    const diff = yearsDiff * 12 + monthsDiff;
    const calendarsCount = Number(calendars) - 1;
    const calendarView = this.props.calendars == 1 ? ' rc-mobile' : '';
    return (
      <div style={onlyClasses ? undefined : { ...styles['DateRange'], ...style }} className={classes.dateRange + calendarView}>
        {this.props.headerText && this.renderHeader()}
        { ranges && (
          <PredefinedRanges
            format={ format }
            ranges={ ranges }
            range={ range }
            theme={ styles }
            onSelect={this.handleSelect.bind(this)}
            onlyClasses={ onlyClasses }
            classNames={ classes } />
        )}

        {(()=>{
          const _calendars = [];
          const _method = offsetPositive ? 'unshift' : 'push';
          for (let i = calendarsCount; i >= 0; i--) {
            // const offset = offsetPositive ? i : -i;
            // const realDiff = offsetPositive ? diff : -diff;
            // const realOffset = (rangedCalendars && i == calendarsCount && diff != 0) ? realDiff : offset;
            const realOffset = -i;

            _calendars[_method](
              <Calendar
                showMonthArrow={ showMonthArrow }
                shownDate={ shownDate }
                disableDaysBeforeToday={ disableDaysBeforeToday }
                lang={ lang }
                key={i}
                id={i}
                offset={ realOffset }
                link={ linkedCalendars && link }
                linkCB={ this.handleLinkChange.bind(this) }
                range={ range }
                format={ format }
                firstDayOfWeek={ firstDayOfWeek }
                theme={ styles }
                minDate={ minDate }
                maxDate={ maxDate }
		            onlyClasses={ onlyClasses }
		            specialDays={ specialDays }
                passiveDays= {passiveDays}
                classNames={ classes }
                calendars={calendars}
                onChange={ this.handleSelect.bind(this) }  />
            );
          }
          return _calendars;
        })()}
        {this.props.footerButton && this.renderFooter()}
      </div>
    );
  }
}

DateRange.defaultProps = {
  linkedCalendars : true,
  theme           : {},
  format          : 'DD/MM/YYYY',
  calendars       : 2,
  onlyClasses     : false,
  offsetPositive  : false,
  classNames      : {dayStartEdge: 'startEdge', dayEndEdge: 'endEdge'},
  specialDays     : [],
  rangedCalendars : true,
  twoStepChange   : true,
  passiveDays     : false,
  headerText      : '',
}

DateRange.propTypes = {
  format          : PropTypes.string,
  firstDayOfWeek  : PropTypes.number,
  calendars       : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startDate       : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  endDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  minDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  maxDate         : PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.string]),
  dateLimit       : PropTypes.func,
  ranges          : PropTypes.object,
  linkedCalendars : PropTypes.bool,
  twoStepChange   : PropTypes.bool,
  theme           : PropTypes.object,
  onInit          : PropTypes.func,
  onChange        : PropTypes.func,
  onlyClasses     : PropTypes.bool,
  specialDays     : PropTypes.array,
  offsetPositive  : PropTypes.bool,
  classNames      : PropTypes.object,
  rangedCalendars : PropTypes.bool,
  passiveDays     : PropTypes.bool,
  headerText      : PropTypes.string,
  footerButton    : PropTypes.func,
}

export default DateRange;
