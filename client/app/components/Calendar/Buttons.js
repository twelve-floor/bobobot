import React, { PureComponent } from 'react';

export default class Buttons extends PureComponent {
  render() {
    return (
      <div className="button-container">
        <button className="round-button">Добавить пациента</button>
        <button className="round-button">Событие</button>
        <button className="round-button">Группа событий</button>
        <button className="round-button">Шаблон группы событий</button>
      </div>
    );
  }
}
