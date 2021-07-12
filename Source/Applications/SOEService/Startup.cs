//******************************************************************************************************
//  Startup.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  01/12/2016 - J. Ritchie Carroll
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Security;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Cors;
using System.Web.Http.ExceptionHandling;
using System.Web.Http.Routing;
using GSF.Web;
using GSF.Web.Hosting;
using GSF.Web.Security;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Json;
using Microsoft.Owin.Cors;
using Newtonsoft.Json;
using Owin;
using SOE.Model;
using SOEService.Controllers;

namespace SOEService
{
    public class HostedExceptionHandler : System.Web.Http.ExceptionHandling.ExceptionHandler
    {
        public override void Handle(ExceptionHandlerContext context)
        {
            Program.Host.LogException(context.Exception);
            base.Handle(context);
        }
    }

    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Modify the JSON serializer to serialize dates as UTC - otherwise, timezone will not be appended
            // to date strings and browsers will select whatever timezone suits them
            JsonSerializerSettings settings = JsonUtility.CreateDefaultSerializerSettings();
            settings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;
            JsonSerializer serializer = JsonSerializer.Create(settings);
            GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () => serializer);
            AppModel model = Program.Host.Model;

            // Load security hub into application domain before establishing SignalR hub configuration
            try
            {
                using (new SecurityHub()) { }
            }
            catch (Exception ex)
            {
                Program.Host.LogException(new SecurityException($"Failed to load Security Hub, validate database connection string in configuration file: {ex.Message}", ex));
            }


            // Configure Windows Authentication for self-hosted web service
            HubConfiguration hubConfig = new HubConfiguration();
            HttpConfiguration httpConfig = new HttpConfiguration();

            //// Setup resolver for web page controller instances
            //httpConfig.DependencyResolver = WebPageController.GetDependencyResolver(WebServer.Default, Program.Host.DefaultWebPage, new AppModel(), typeof(AppModel));

            // Make sure any hosted exceptions get propagated to service error handling
            httpConfig.Services.Replace(typeof(IExceptionHandler), new HostedExceptionHandler());

            // Enabled detailed client errors
            hubConfig.EnableDetailedErrors = true;

            // Enable GSF session management
            httpConfig.EnableSessions(AuthenticationOptions);

            // Enable GSF role-based security authentication
            app.UseAuthentication(AuthenticationOptions);

            // Enable cross-domain scripting default policy - controllers can manually
            // apply "EnableCors" attribute to class or an action to override default
            // policy configured here
            try
            {
                if (!string.IsNullOrWhiteSpace(model.Global.DefaultCorsOrigins))
                    httpConfig.EnableCors(new EnableCorsAttribute(model.Global.DefaultCorsOrigins, model.Global.DefaultCorsHeaders, model.Global.DefaultCorsMethods) { SupportsCredentials = model.Global.DefaultCorsSupportsCredentials });
            }
            catch (Exception ex)
            {
                Program.Host.LogException(new InvalidOperationException($"Failed to establish default CORS policy: {ex.Message}", ex));
            }

            // Load ServiceHub SignalR class
            app.MapSignalR(hubConfig);

            httpConfig.MapHttpAttributeRoutes(new CustomDirectRouteProvider());

            // Load the WebPageController class and assign its routes
            app.UseWebApi(httpConfig);

            app.UseWebPageController(WebServer.Default, Program.Host.DefaultWebPage, Program.Host.Model, typeof(AppModel), AuthenticationOptions);

            // Check for configuration issues before first request
            httpConfig.EnsureInitialized();
        }

        // Static Properties

        /// <summary>
        /// Gets the authentication options used for the hosted web server.
        /// </summary>
        public static AuthenticationOptions AuthenticationOptions { get; } = new AuthenticationOptions();
    }

    public class CustomDirectRouteProvider : DefaultDirectRouteProvider
    {
        protected override IReadOnlyList<IDirectRouteFactory>
        GetActionRouteFactories(HttpActionDescriptor actionDescriptor)
        {
            return actionDescriptor.GetCustomAttributes<IDirectRouteFactory>(inherit: true);
        }
    }

}
