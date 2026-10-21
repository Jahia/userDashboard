import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Button,
  Checkbox,
  Download,
  Edit,
  FileContent,
  Folder,
  Header,
  Language,
  Setting,
  SortIndicator,
  Table,
  TableBody,
  TableBodyCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Tooltip,
  Typography,
  Visibility,
  WebProject
} from '@jahia/moonstone';

import '../shared/pageHeader.css';
import './projects.css';

// How long the export buttons stay busy when the browser never hands focus back (some downloads
// do not take it away in the first place).
const EXPORT_PENDING_MS = 15000;

const pad = value => String(value).padStart(2, '0');

// The export file name carries when it was asked for, as yyyy-MM-dd-HH-mm.
const exportTimestamp = () => {
  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
};

const openLink = (url, target) => {
  window.open(url, target, target === '_blank' ? 'noopener' : undefined);
};

/**
 * One icon button of the Actions column. An action the user may not take stays in place,
 * disabled, so every row keeps the same layout and the tooltip says why.
 */
function ActionButton({label, unavailableLabel, icon, onClick}) {
  if (!onClick) {
    return (
      <Tooltip label={unavailableLabel}>
        <span className="ud-projects-actionWrapper">
          <Button variant="ghost" size="big" icon={icon} aria-label={`${label} - ${unavailableLabel}`} isDisabled/>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={label}>
      <Button variant="ghost" size="big" icon={icon} aria-label={label} onClick={onClick}/>
    </Tooltip>
  );
}

function SiteActions({site, columns, labels}) {
  // An empty link is the JSP saying the user may not follow it.
  const link = (url, target) => (url ? () => openLink(url, target) : null);

  return (
    <div className="ud-projects-actions">
      {columns.edit && (
        <ActionButton label={labels.edit} unavailableLabel={labels.notAvailable} icon={<Edit/>} onClick={link(site.links.edit, '_parent')}/>
      )}
      {columns.preview && (
        <ActionButton label={labels.preview} unavailableLabel={labels.notAvailable} icon={<Visibility/>} onClick={link(site.links.preview, '_blank')}/>
      )}
      {columns.live && (
        <ActionButton
          label={labels.live}
          unavailableLabel={site.isPublished ? labels.notAvailable : labels.notPublished}
          icon={<Language/>}
          onClick={link(site.links.live, '_blank')}
        />
      )}
      <ActionButton label={labels.files} unavailableLabel={labels.notAvailable} icon={<Folder/>} onClick={link(site.links.files, '_blank')}/>
      <ActionButton label={labels.content} unavailableLabel={labels.notAvailable} icon={<FileContent/>} onClick={link(site.links.content, '_blank')}/>
      {columns.editProperties && (
        <ActionButton
          label={labels.properties}
          unavailableLabel={labels.notAvailable}
          icon={<Setting/>}
          // The modal itself is still the JSP's, driven by manageSites.js.
          onClick={site.canEditProperties ? () => window.modalSiteEditProperties?.(site.identifier) : null}
        />
      )}
    </div>
  );
}

export default function App({config}) {
  const {labels, columns, sites, canExport} = config;
  const [sortDirection, setSortDirection] = useState('ascending');
  const [selected, setSelected] = useState(() => new Set());
  const [isExporting, setIsExporting] = useState(false);
  const exportTimerRef = useRef(null);

  const sortedSites = useMemo(() => {
    const sorted = [...sites].sort((a, b) => a.title.localeCompare(b.title, undefined, {numeric: true, sensitivity: 'base'}));

    return sortDirection === 'ascending' ? sorted : sorted.reverse();
  }, [sites, sortDirection]);

  const selectableNames = useMemo(() => sites.filter(site => site.isSelectable).map(site => site.name), [sites]);
  const hasSelectionColumn = canExport && selectableNames.length > 0;
  const isAllSelected = selectableNames.length > 0 && selectableNames.every(name => selected.has(name));

  const toggleSite = useCallback(name => {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }

      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected(isAllSelected ? new Set() : new Set(selectableNames));
  }, [isAllSelected, selectableNames]);

  const endExport = useCallback(() => {
    window.clearTimeout(exportTimerRef.current);
    exportTimerRef.current = null;
    setIsExporting(false);
  }, []);

  useEffect(() => () => window.clearTimeout(exportTimerRef.current), []);

  // Submits the JSP's export form, which carries Jahia's CSRF token. The response is the zip,
  // downloaded as an attachment, so the page itself stays where it is.
  const exportSites = useCallback(live => {
    const form = document.getElementById('exportForm');
    const names = [...selected];
    if (!form || names.length === 0) {
      return;
    }

    form.querySelectorAll('input[name=sitebox]').forEach(input => input.remove());
    names.forEach(name => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'sitebox';
      input.value = name;
      form.appendChild(input);
    });
    form.querySelector('input[name=live]').value = String(live);

    const prefix = names.length === 1 ? names[0] : 'sites';
    form.action = `${config.exportBaseUrl}${prefix}_${live ? '' : 'staging_'}export_${exportTimestamp()}.zip`;

    setIsExporting(true);
    window.addEventListener('focus', endExport, {once: true});
    exportTimerRef.current = window.setTimeout(endExport, EXPORT_PENDING_MS);
    form.submit();
  }, [config.exportBaseUrl, endExport, selected]);

  const isExportDisabled = isExporting || selected.size === 0;

  const toolbar = (canExport || config.canManageProjects) ? (
    <>
      {config.canManageProjects && (
        <Button
          variant="ghost"
          icon={<WebProject/>}
          label={labels.manage}
          onClick={() => openLink(config.projectManagementUrl, '_parent')}
        />
      )}
      {canExport && (
        <>
          <Button variant="ghost" icon={<Download/>} label={labels.exportLive} isDisabled={isExportDisabled} onClick={() => exportSites(true)}/>
          <Button variant="ghost" icon={<Download/>} label={labels.exportStaging} isDisabled={isExportDisabled} onClick={() => exportSites(false)}/>
        </>
      )}
    </>
  ) : undefined;

  const columnCount = 2 + (hasSelectionColumn ? 1 : 0);

  return (
    <>
      <div className="ud-pageHeader">
        <Header
          title={config.title}
          toolbarLeft={toolbar}
          toolbarRight={isExporting ? (
            <Typography variant="caption" role="status" aria-live="polite">{labels.exportInProgress}</Typography>
          ) : undefined}
        />
      </div>
      <div className="ud-projects-card">
        <Table className="ud-projects-table">
          <TableHead>
            <TableRow>
              {hasSelectionColumn && (
                <TableHeadCell width="48px">
                  <Checkbox
                    aria-label={labels.selectAll}
                    checked={isAllSelected}
                    indeterminate={selected.size > 0 && !isAllSelected}
                    onChange={toggleAll}
                  />
                </TableHeadCell>
              )}
              <TableHeadCell
                className="ud-projects-sortable"
                aria-sort={sortDirection}
                onClick={() => setSortDirection(current => (current === 'ascending' ? 'descending' : 'ascending'))}
              >
                <Typography weight="bold">{labels.site}</Typography>
                <SortIndicator isSorted direction={sortDirection}/>
              </TableHeadCell>
              <TableHeadCell width="320px">
                <Typography weight="bold">{labels.actions}</Typography>
              </TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSites.length === 0 && (
              <TableRow>
                <TableBodyCell colSpan={columnCount}>
                  <Typography>{labels.noProjects}</Typography>
                </TableBodyCell>
              </TableRow>
            )}
            {sortedSites.map(site => (
              <TableRow key={site.name} isSelected={selected.has(site.name)}>
                {hasSelectionColumn && (
                  <TableBodyCell width="48px">
                    {site.isSelectable && (
                      <Checkbox aria-label={site.title} checked={selected.has(site.name)} onChange={() => toggleSite(site.name)}/>
                    )}
                  </TableBodyCell>
                )}
                <TableBodyCell>{site.title}</TableBodyCell>
                <TableBodyCell width="320px">
                  <SiteActions site={site} columns={columns} labels={labels}/>
                </TableBodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
