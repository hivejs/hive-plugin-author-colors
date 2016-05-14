/** 
 * hive.js 
 * Copyright (C) 2013-2016 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License version 2
 * as published by the Mozilla Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the Mozilla Public License
 * along with this program.  If not, see <https://www.mozilla.org/en-US/MPL/2.0/>.
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
      yield {type: SET_COLOR, payload: color, id: state.session.user.id}
      yield api.action_user_update(state.session.user.id, {color})
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
      // invisible input
      var input = new Widget(h('input', {
        attributes: {type: 'color', value: color}
      , 'ev-change': evt => {
          store.dispatch(authorColors.action_setColor(evt.currentTarget.value))
        }
      }))
      children.push(input)
      // visible button that triggers the color input :/ hACk alarm
      var button = h('button.btn.btn-default.btn-xs', {
        'ev-click': evt => input.node.click()
      , style: {color: color}
      }, h('i.glyphicon.glyphicon-tint'))
      children.push(button)
    }
  })

  register(null, {authorColors: authorColors})
}

const Widget = function (vnode){this.node = vdom.create(vnode)}
Widget.prototype.type = "Widget"
Widget.prototype.init = function(){return this.node}
Widget.prototype.update = function(previous, domNode){this.node = domNode; return null}
Widget.prototype.destroy = function(domNode){}
