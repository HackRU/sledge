import * as React from "react";

class RatingBox extends React.Component<Props, State> {
  constructor(props : Props) {
    super(props);

    this.state = {
      // TODO: These should probably be loaded from somewhere
      categories: [{
        name: "Egregiousness",
        selected: -1,
        dirty: true,
        id: 0
      }, {
        name: "Homeliness",
        selected: -1,
        dirty: true,
        id: 1
      }, {
        name: "Abhorentness",
        selected: -1,
        dirty: true,
        id: 2
      }, {
        name: "Inoperativeness",
        selected: -1,
        dirty: true,
        id: 3
      }],

      noshow: false
    };
  }

  componentWillReceiveProps(newProps) {
    // TODO: Is there a better way to do this? Maybe we shouldn't
    //       be so reliant on stateful components?
    if ( this.props.hackId !== newProps.hackId ) {
      this.reset();
    }
  }

  reset() {
    this.setState( (prevState, props) => {
      let cats = prevState.categories.slice(0);
      for (let cat of cats) {
        cat.dirty = true;
        cat.selected = -1;
      }
      return { categories: cats };
    });
  }

  select(catId, score) {
    this.setState( (prevState, props) => {
      let cats = prevState.categories.slice(0);
      cats[catId].selected = score;
      cats[catId].dirty = true;
      return { categories: cats };
    });
  }

  submit() {
    let selected = this.getSelected();
    if (!selected.valid) return;

    this.setState( (prevState, props) => {
      let cats = prevState.categories.slice(0);
      for (let cat of cats) {
        cat.dirty = false;
      }
      return { categories: cats };
    });

    this.props.onSubmit(selected.total);
  }

  getSelected() {
    let total = 0;
    let valid = true;

    if ( this.state.noshow ) {
      return {
        total: -1,
        valid: true
      };
    }

    for (let cat of this.state.categories) {
      if ( cat.selected >= 0 ) {
        total += cat.selected;
      } else {
        valid = false;
      }
    }

    if ( total <= 0 || 20 < total )
      valid = false;

    return { total, valid };
  }

  renderCategory(cat) {
    let buttons = [];
    for (let i=0;i<6;i++) {
      let selectedClass = i==cat.selected?" ratingbox-selected":"";
      buttons.push(
        <button
          className = {"btn btn-primary"+selectedClass}
          onClick = {() => this.select(cat.id, i)}
        >{i.toString()}</button>
      );
    }

    let dirtyClass = cat.dirty?" ratingbox-dirty":"";
    return (
      <div className="ratingbox-category">
        <div className="ratingbox-catname">
          <h3>cat.name</h3>
        </div>
        <div className={"btn-group"+dirtyClass}>
          ...buttons
        </div>
      </div>
    );
  }

  renderSelected() {
    let selected = this.getSelected();
    let validClass = selected.valid ? "ratingbox-valid" : "ratingbox-invalid";

    return (
      <span className={validClass}>
        {selected.total >= 0 ? "Selected: "+selected.total.toString() : "no show"}
      </span>
    );
  }

  renderChosen() {
    let total = this.props.chosen;

    let totalString;
    if ( total > 0 ) {
      totalString = "Current: " + total.toString();
    } else if ( total < 0 ) {
      totalString = "no show";
    } else {
      totalString = "unrated";
    }

    return (
      <span>{totalString}</span>
    );
  }

  render() {
    let cats = [];
    if (!this.state.noshow)
      cats = this.state.categories.map( c => this.renderCategory(c) );

      return (
        <div className="ratingbox-comp">
          <div>

            <div className="ratingbox-noshow">
              <button
                className="btn btn-primary"
                onClick={() => this.setState( (prevState, props) => ({ noshow: !prevState.noshow }) )}
              >{this.state.noshow ? "Mark Hack as Present" : "Mark Hack as No Show"}</button>
            </div>

            ...cats,

            <div className="ratingbox-summary">
              <div className="ratingbox-totalselected">
                <span>{this.renderSelected()}</span>
              </div>
              <div className="ratingbox-totalchosen">
                <span>{this.renderChosen()}</span>
              </div>
            </div>

            <div className="ratingbox-submit">
              <button
                className="btn btn-primary"
                onClick={() => this.submit()}
              >{"SUBMIT"}</button>
            </div>

          </div>
        </div>
      );
    }
}

export interface Props {
  hackId : number;
  chosen : number;
  onSubmit : (n:number) => void;
}

interface State {
  categories : Array<Category>;
  noshow : boolean;
}

interface Category {
  name : string;
  selected : number;
  dirty : boolean;
  id : number;
}
