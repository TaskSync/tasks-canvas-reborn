# Tasks Canvas (reborn)

This project aims to resurrect the famous
[Google Tasks Canvas](https://www.reddit.com/r/productivity/comments/arihi9/google_tasks_canvas_shutting_down/),
a keyboard-centric task management webapp.

**Still in an early stage, work in progress, doesnt sync with Goole Tasks just yet.**

Unlike [many](https://www.gtaskd.com/)
[other](https://chrome.google.com/webstore/detail/full-screen-for-google-ta/ndbaejgcaecffnhlmdghchfehkflgfkj?hl=en)
[clones](https://www.reddit.com/r/productivity/comments/b8zaoc/alternatives_to_google_tasks/),
this one tries to be as close to the original as possible, with additional features under the hood.

## Demo

URL: [canvas.taskbot.app](https://canvas.taskbot.app)

Please [report issues](https://github.com/TaskSync/tasks-canvas-reborn/issues/new).

![screenshot](https://tasksync.github.io/tasks-canvas-reborn/screenshot.png)

## Progress

### What works

- list layout
- keyboard navigation
- simple actions (edit, split, merge, indent, outdent)
- persisting in localStorage

### TODO

- sycing with Google Tasks API (using the [TaskBot's engine](https://github.com/TaskSync/TaskBot.app))
- conflict resolution
- import / export (JSON)
- task lists
- dialogs
- sorting
- drag & drop
- PWA
- ...more in [TODO](https://github.com/TaskSync/tasks-canvas-reborn/blob/master/TODO)
