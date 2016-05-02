/**
 * hive.js
 * Copyright (C) 2013-2015 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var vdom = require('virtual-dom')
  , h = vdom.h

const SET_COLOR = 'AUTHORCOLORS_SET_COLOR'

module.exports = setup
module.exports.consumes = ['ui', 'api', 'presence']
module.exports.provides = ['authorColors']
function setup(plugin, imports, register) {
  var ui = imports.ui
    , api = imports.api
    , presence = imports.presence

  ui.reduxRootReducers.push((state, action) => {
    if(SET_COLOR === action.type) {
      return {...state, session: {
        ...state.session
      , user: {
        ...state.session.user
        , attributes: {
          ...state.session.user.attributes
          , color: action.payload
          }
        }
      }}
    }
    return state
  })

  var authorColors = {
    action_setColor: function*(color) {
      var state = ui.store.getState()
      yield api.action_user_update(state.session.user.id, {color})
      yield {type: SET_COLOR, payload: color, id: state.session.user.id}
    }
  }

  presence.onRenderUser(function(store, user, props, children) {
    var state = store.getState()
    // Border color
    var style = props.style || (props.style = {})
      , color = user.attributes.color || '#777'
    style['border-color'] = color

    // Color picker if user === this user
    if(user.id == state.session.user.id) {
      var input = h('input.btn.btn-default',
      { attributes: {type: 'color', value: color}
      , 'ev-change': evt => {
          store.dispatch(authorshipMarkers.action_setColor(evt.currentTarget.value))
        }
      })
     children.push(input)
    }
  })

  register(null, {authorColors: authorColors})
}

