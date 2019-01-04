import React from 'react';
import PropTypes from 'prop-types';

const FloorHelperForm = (props) => {
    return <form>
        <div style={{padding: '5px'}}>
            <h5>Room Dimensions in Feet</h5>
            <input style={{width: '65px', marginLeft: '10px', marginRight: '8px'}} placeholder="Width"  type="number" name='room_w' value={props.values.room_w} onChange={props.onChange} />X
            <input style={{width: '65px', marginLeft: '10px'}} placeholder="Height" type="number" name='room_h' value={props.values.room_h} onChange={props.onChange} />
        </div>
        <div style={{padding: '5px'}}>
            <h5>Plank Dimensions in Inches</h5>
            <input style={{width: '65px', marginLeft: '10px', marginRight: '8px'}} step="0.25" placeholder="Length" type="number" name='plank_w' value={props.values.plank_w} onChange={props.onChange} />X
            <input style={{width: '65px', marginLeft: '10px'}} step="0.25" placeholder="Width"  type="number" name='plank_h' value={props.values.plank_h} onChange={props.onChange} />
        </div>
        <div style={{padding: '5px'}}>
            <h5>Criteria</h5>
            <div className="btn-group btn-group-toggle" data-toggle="buttons">
                <label className="btn btn-secondary active" onClick={props.onDirectionChange}>
                    <input type="radio" autoComplete="off" checked/> Left to Right
                </label>
                <label className="btn btn-secondary" onClick={props.onDirectionChange}>
                    <input type="radio" autoComplete="off"/> Right to Left
                </label>
            </div>
            <div>
                <label style={{fontWeight: 'bold', marginTop: '15px'}}>
                    Min. End Plank Length in Inches
                    <input style={{width: '65px', marginLeft: '10px'}} type="number" step="0.25" placeholder="12" name="min_end_plank" value={props.values.min_end_plank} onChange={props.onChange}/>
                </label>
            </div>
            <div>
                <label style={{fontWeight: 'bold', marginTop: '15px'}}>
                    Gap From Wall in Inches
                    <input style={{width: '65px', marginLeft: '10px'}} type="number" step="0.25" placeholder=".25" name="wall_gap" value={props.values.wall_gap} onChange={props.onChange}/>
                </label>
            </div>
            <div>
                <label style={{fontWeight: 'bold', marginTop: '15px'}}>
                    Min. Distance Between Joints in Inches
                    <input style={{width: '65px', marginLeft: '10px'}} type="number" step="0.25" placeholder="6" name="joint_distance" value={props.values.joint_distance} onChange={props.onChange}/>
                </label>
            </div>
        </div>
        <div style={{padding: '5px'}}>
            <h5>Zoom</h5>
            <button className="btn btn-primary glyphicon glyphicon-plus" style={{height: '45px', width: '50px', margin: '5px'}} name="plus"  type="button" onClick={props.onZoom}>In</button>
            <button className="btn btn-primary glyphicon glyphicon-minus" style={{height: '45px', width: '50px', margin: '5px'}} name="minus" type="button" onClick={props.onZoom}>Out</button>
        </div>
    </form>;
};

FloorHelperForm.propTypes = {
    values:            PropTypes.object.isRequired,
    onChange:          PropTypes.func.isRequired,
    onZoom:            PropTypes.func.isRequired,
    onDirectionChange: PropTypes.func.isRequired
};

export default FloorHelperForm;