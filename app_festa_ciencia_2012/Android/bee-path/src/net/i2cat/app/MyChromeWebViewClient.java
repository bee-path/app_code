/**
 *   *
 *  Copyright (C) Fundació i2CAT.
 *
 *  This library is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 2.1 of the License, or (at your option) any later version.
 *  
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Lesser General Public License for more details.
 *
 * @author  Fundació i2CAT. David Roldan
 * @contact david.roldan@i2cat.net
 * @version 1.0 
 *
 */

package net.i2cat.app;

import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;

public class MyChromeWebViewClient extends WebChromeClient {

    public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
        callback.invoke(origin, true, false);
    }

}