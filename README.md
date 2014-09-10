Code actually lives in Google docs script editor :( This repository is for copy/paste.

# Development

### Setup

1. Create a new Google doc
2. Click "tools" in the menu bar and click "Script Editor"
3. Create a new blank project, you should have a single script file called `Code.gs`, name the project Irregardless
4. Copy the contents of this repsitory into the plugin files
     1. copy the contents of Code.js into Code.js
     2. select File > New >  Html File.  Call it "sidebar.html" (name is important)
     3. Save both files
5. Switch back to your new Google doc
6. Refresh the page
7. From the Menubar click "Add-ons", you should see Irregardless in the menu hover over it and click "Start"

### Editing

* Get back to the script editor by clicking "Tools > Script Editor" from a Google doc.

### Google Doc Addon Basics

##### sidebar.html

* this is the html that makes up the Sidebar
* All styles are in the top <style></style> tags.
* All javascript functions that interact with the Sidebar's DOM have to live in this file's bottom <script></script> tags.  External script files do not have access to this Sidebar DOM

##### Code.gs

* this file loads the addon into the Google doc.
* this file has access to the current active Google Doc through `DocumentApp`
* all functions defined in here get called asynchronously from scripts in sidebar.html through `google.script.run`
* `onOpen`, `onInstall` must be defined so that Google Docs knows how to hook into this Addon.

#### Useful tips

* From the script editor: View > Execution Logs and View > Logs
* Logger.log is Google scripts Logger.
* Read the docs: https://developers.google.com/apps-script/quickstart/docs
