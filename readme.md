## Features:
- [x] Login to any room.
- [x] First to enter gets room get teacher interface.
- [x] Teacher display shows student's turtles.
- [x] When students move arrow keys, their turtle moves around.
- [x] Students see reporters such as position, shape, color and state of infection.
- [x] When a teacher logs out, students leave room and return to login state.
- [x] When a student logs out, the teacher removes student's turtle
- [x] Students see reporters such as position, shape, color and state of infection. 
- [x] Get multiple plots to work.
- [x] Make plot pointer show correct position.
- [x] Admin capabilities.

## Use NetLogo primitive commands and reporters
- [x] hubnet-fetch-message 
- [x] hubnet-send
- [x] hubnet-message-waiting?
- [x] hubnet-exit-message?
- [x] hubnet-enter-message?
- [x] hubnet-message
- [x] hubnet-message-source
- [x] hubnet-message-tag

## Add variable to turtle prototype
- [x] userid

## Known Issues
- When you turn the "Go" button off, messages from the client accumulate.

## Convert a NetLogo Hubnet Activity to Web
- Open NetLogo Hubnet Activity in NetLogo java app. Save as NetLogo Web.
- Re-create Client Interface. Save as NetLogo Web.
- Copy and paste data from $("#nlogo-code") into index.html
- Copy and paste new client interface into index.html
- Update config file to match model
- Update js/events.js for any sliders on student's interface (not currently generalizable)