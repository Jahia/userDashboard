/*
 * Copyright (C) 2002-2022 Jahia Solutions Group SA. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jahia.modules.profile;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TimeZoneOptionsProvider {
    private static final List<TimeZoneOption> OPTIONS;
    private static final Map<String, String> LABELS_BY_ID;

    static {
        List<String> zoneIds = new ArrayList<>(ZoneId.getAvailableZoneIds());
        Collections.sort(zoneIds);

        List<TimeZoneOption> options = new ArrayList<>(zoneIds.size());
        Map<String, String> labelsById = new HashMap<>(zoneIds.size());
        Instant now = Instant.now();

        for (String zoneIdValue : zoneIds) {
            ZoneId zoneId = ZoneId.of(zoneIdValue);
            String label = buildLabel(zoneId, now);
            options.add(new TimeZoneOption(zoneIdValue, label));
            labelsById.put(zoneIdValue, label);
        }

        OPTIONS = Collections.unmodifiableList(options);
        LABELS_BY_ID = Collections.unmodifiableMap(labelsById);
    }

    public List<TimeZoneOption> getOptions() {
        return OPTIONS;
    }

    public Map<String, String> getLabelsById() {
        return LABELS_BY_ID;
    }

    private static String buildLabel(ZoneId zoneId, Instant now) {
        ZonedDateTime zonedDateTime = ZonedDateTime.ofInstant(now, zoneId);
        return zoneId.getId() + " (UTC" + formatOffset(zonedDateTime.getOffset()) + ")";
    }

    private static String formatOffset(ZoneOffset zoneOffset) {
        String offsetId = zoneOffset.getId();
        return "Z".equals(offsetId) ? "+00:00" : offsetId;
    }

    public static class TimeZoneOption {
        private final String value;
        private final String label;

        public TimeZoneOption(String value, String label) {
            this.value = value;
            this.label = label;
        }

        public String getValue() {
            return value;
        }

        public String getLabel() {
            return label;
        }
    }
}