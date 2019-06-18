Examples here are for running in an [OpenFin](https://openfin.co/) environment.

### activ-workstation

`packages/openfin/activ-workstation` is a simple OpenFin application that packages the [WebComponent browser samples](../browser/).

### Visual Studio Code

Tasks:

* `serve-activ-workstation`: serves the activ-workstation distribution on port 8881.
* `start-activ-workstation`: uses the OpenFin cli launcher to the server on port 8881.

Debug luanch configurations:

* `Launch activ-workstation`: runs the `start-activ-workstation` task in the background and connects the Visual Studio Code debugger to it. You should manually run the `serve-activ-workstation` task first.
