import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'ng-table',
  template: `
    <table class="table dataTable" ngClass="{{config.className || ''}}"
           role="grid" style="width: 100%;">
      <thead>
        <tr role="row">
          <th *ngFor="let column of columns" [ngTableSorting]="config" [column]="column" 
              (sortChanged)="onChangeTable($event)" ngClass="{{column.className || ''}}">
            {{column.title}}
            <small *ngIf="config && column.sort !== 'asc' && column.sort !== 'desc' && column.sort !== false">
              <i class="material-icons">arrow_drop_up</i>
              <i class="material-icons">arrow_drop_down</i>
            </small>
            <i class="material-icons" *ngIf="config && column.sort === 'asc'">arrow_drop_up</i>
            <i class="material-icons" *ngIf="config && column.sort === 'desc'">arrow_drop_down</i>
          </th>
        </tr>
      </thead>
      <tbody>
      <tr *ngIf="showFilterRow">
        <td *ngFor="let column of columns">
          <input *ngIf="column.filtering" placeholder="{{column.filtering.placeholder}}"
                 [ngTableFiltering]="column.filtering"
                 class="form-control"
                 style="width: auto;"
                 (tableChanged)="onChangeTable(config)"/>
        </td>
      </tr>
        <tr *ngFor="let row of rows">
          <td (click)="cellClick(row, column.name, $event)" *ngFor="let column of columns" [innerHtml]="sanitize(getData(row, column.name))"></td>
        </tr>
      </tbody>
    </table>
  `
})
export class NgTableComponent {
  // Table values
  @Input() public rows:Array<any> = [];

  @Input()
  public set config(conf:any) {
    if (!conf.className) {
      conf.className = 'table-striped table-bordered';
    }
    if (conf.className instanceof Array) {
      conf.className = conf.className.join(' ');
    }
    this._config = conf;
  }

  // Outputs (Events)
  @Output() public tableChanged:EventEmitter<any> = new EventEmitter();
  @Output() public cellClicked:EventEmitter<any> = new EventEmitter();

  public showFilterRow:Boolean = false;

  @Input()
  public set columns(values:Array<any>) {
    values.forEach((value:any) => {
      if (value.filtering) {
        this.showFilterRow = true;
      }
      if (value.className && value.className instanceof Array) {
        value.className = value.className.join(' ');
      }
      let column = this._columns.find((col:any) => col.name === value.name);
      if (column) {
        Object.assign(column, value);
      }
      if (!column) {
        this._columns.push(value);
      }
    });
  }

  private _columns:Array<any> = [];
  private _config:any = {};

  public constructor(private sanitizer:DomSanitizer) {
  }

  public sanitize(html:string):SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  public get columns():Array<any> {
    return this._columns;
  }

  public get config():any {
    return this._config;
  }

  public get configColumns():any {
    let sortColumns:Array<any> = [];

    this.columns.forEach((column:any) => {
      if (column.sort) {
        sortColumns.push(column);
      }
    });

    return {columns: sortColumns};
  }

  public onChangeTable(column:any):void {
    this._columns.forEach((col:any) => {
      if (col.name !== column.name && col.sort !== false) {
        col.sort = '';
      }
    });
    this.tableChanged.emit({sorting: this.configColumns});
  }

  public getData(row:any, propertyName:string):string {
    return propertyName.split('.').reduce((prev:any, curr:string) => prev[curr], row);
  }

  public cellClick(row:any, column:any, event:any):void {
    this.cellClicked.emit({row, column, event});
  }
}
