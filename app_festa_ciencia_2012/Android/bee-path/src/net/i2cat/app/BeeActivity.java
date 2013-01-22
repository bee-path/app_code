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

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.location.LocationManager;
import android.os.Bundle;
import android.provider.Settings;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.FragmentActivity;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.GeolocationPermissions;
import android.webkit.WebView;

public class BeeActivity extends FragmentActivity {
    
    private WebView myWebView;
    private Dialog alert = null;
    
    private static final int MENU_EXIT = Menu.FIRST;
    private static final int EXIT_DIALOG = 0;
    
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        setContentView(R.layout.main);
        
        myWebView = (WebView) findViewById(R.id.webview);
        
        myWebView.getSettings().setJavaScriptEnabled(true);
        myWebView.getSettings().setGeolocationEnabled(true);
        myWebView.setWebChromeClient(new MyChromeWebViewClient());     
        
          
        myWebView.loadUrl("http://server1.bee-path.net/app/index.html");   
                
    }
    
    public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
        callback.invoke(origin, true, false);        
    }

    
    @Override
    protected void onStart() {
        super.onStart();

        // Check if the GPS setting is currently enabled on the device.
        // This verification should be done during onStart() because the system calls this method
        // when the user returns to the activity, which ensures the desired location provider is
        // enabled each time the activity resumes from the stopped state.
        LocationManager locationManager =
                (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        final boolean gpsEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);

        if (!gpsEnabled) {
            // Build an alert dialog here that requests that the user enable
            // the location services, then when the user clicks the "OK" button,
            // call enableLocationSettings()
            new EnableGpsDialogFragment().show(getSupportFragmentManager(), "enableGpsDialog");
        }
    }
    
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Check if the key event was the Back button and if there's history
        if ((keyCode == KeyEvent.KEYCODE_BACK) && myWebView.canGoBack()) {
            myWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        menu.add(0, MENU_EXIT, 1, "EXIT");
        return true;
    }

    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case MENU_EXIT:
                showDialog(EXIT_DIALOG);                
            break;            
        }       
        return true;
    }
    
    public void stop() {
        if (alert != null && alert.isShowing())
            alert.dismiss();
        super.finish();
    }
    
    @Override
    protected Dialog onCreateDialog(int id) {
        AlertDialog.Builder builder = null;
        switch(id) {
            case EXIT_DIALOG:
                builder = new AlertDialog.Builder(this);
                builder.setMessage("Do you want to exit?")
                       .setCancelable(true)
                       .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                           public void onClick(DialogInterface dialog, int id) {  
                               stop();                               
                           }                      
                       });
                alert = builder.create();
            break;               
        }
        return alert;
    }
    
 // Method to launch Settings
    private void enableLocationSettings() {
        Intent settingsIntent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
        startActivity(settingsIntent);
    }
    
    /**
     * Dialog to prompt users to enable GPS on the device.
     */
    private class EnableGpsDialogFragment extends DialogFragment {

        @Override
        public Dialog onCreateDialog(Bundle savedInstanceState) {
            return new AlertDialog.Builder(getActivity())
                    .setTitle(R.string.enable_gps)
                    .setMessage(R.string.enable_gps_dialog)
                    .setPositiveButton(R.string.enable_gps, new DialogInterface.OnClickListener() {
                        
                        public void onClick(DialogInterface dialog, int which) {
                            enableLocationSettings();
                        }
                    })
                    .create();
        }
    }
}