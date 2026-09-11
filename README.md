<a href="https://www.jahia.com/">
    <img src="https://www.jahia.com/modules/jahiacom-templates/images/jahia-3x.png" alt="Jahia logo" title="Jahia" align="right" height="60" />
</a>

User Dashboard
======================
User dashboard module for the Digital Experience Manager platform.

## Current State

The module now uses a hybrid approach:

- React 18 + Moonstone power the migrated edit user details experience.
- Vite builds the frontend bundle and Maven packages it into the Jahia module.
- Legacy Bootstrap, jQuery, DataTables and the former anthracite theme have been removed from the migrated dashboard views.
- Native helpers now handle table sorting and pagination in dashboard listings.

Recent functional changes include:

- The edit user details preferences section now exposes a controlled time zone selector backed by canonical IANA identifiers stored in the user timeZone property.
- The public profile layout now stacks its sections vertically, uses the same content width as the private header, and no longer renders the former grey rounded panel background.
- The public view has been removed from the profile
- Edit actions are now rendered in section headers for About me, identity and professional information, contact, password and preferences.
- The edit profile header no longer shows the private/public toggle buttons.
- The My Pages listing now defaults to an ascending alphabetical sort on the Site column, formats dates using the current user locale without the time portion, renders dates in a normal font, and highlights authors from other users in blue while keeping the current user unaccented.
- The My Projects listing now shows all rows at once instead of paginating the table, defaults to an ascending alphabetical sort on the Project name column, and uses consistent dark action icons.
- The My Files view now supports effective upload and folder creation in the current directory, enforces the displayed naming constraints client-side, truncates long display names without losing the full value, aligns its date format with My Pages, and uses the same dark icon styling as the other actions.

## Migrated Views

The main dashboard views now use neutral Jahia view names:

- settingsDashboard for the dashboard shell, profile and my files views.
- userContent.settingsDashboard for user content listings.
- sites.settingsDashboard for project listings.

The old Bootstrap3GoogleMaterialStyle naming has been removed from the repository and from the Jahia view mappings.

## Frontend Architecture

- The profile edition flow is rendered through a React bundle mounted inside the Jahia JSP view.
- Listing screens remain server-rendered JSPs, with lightweight native JavaScript for sorting, pagination and dialogs.
- simpleTable.js replaces the old DataTables-based behavior for migrated tables.
- api.js, manageSites.js, myFilesDashboard.js and editUserDetailsUtils.js remain the main runtime helpers shipped by the module.

For profile preferences, JSP still serializes the server-side configuration into the React app, while controlled field option sets such as time zones can be provided by lightweight Java helpers exposed to JSP.

## Build

Use the standard Maven build to validate both backend resources and the frontend bundle:

```bash
mvn -DskipTests process-resources
```

To generate the packaged Jahia module JAR:

```bash
mvn clean package
```

## Repository Notes

- Jahia view mappings are declared in src/main/import/repository.xml.
- React sources live under src/main/frontend and are emitted into the packaged resources during the Maven build.
- Server-rendered resources and JSP views live under src/main/resources.

## Open-Source

This is an Open-Source module, you can find more details about Open-Source @ Jahia [in this repository](https://github.com/Jahia/open-source).

