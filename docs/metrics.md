# ApexTrack Metric Definitions & Mathematical Ground Truth

All internal calculations and stored records in ApexTrack operate exclusively in **SI units (International System of Units)** with **UTC timestamps**.

---

## 1. Units Reference Table

| Metric | Storage Unit | Symbol | Display Conversions (UI Only) |
|---|---|---|---|
| Distance | Meters | `m` | `km = m / 1000`<br>`miles = m * 0.000621371` |
| Duration | Seconds | `s` | `hh:mm:ss` |
| Speed | Meters per second | `m/s` | `km/h = m/s * 3.6`<br>`mph = m/s * 2.23694` |
| Acceleration | Meters per second² | `m/s²` | `g = (m/s²) / 9.80665` |
| Coordinates | Decimal degrees | `°` | WGS84 standard `[-90, 90]`, `[-180, 180]` |
| Timestamp | UTC Epoch / ISO | `ms` / `ISO` | User's local timezone format |

---

## 2. Core Formulas

### Haversine Great-Circle Distance
Computes the shortest distance over the Earth's surface between two points $P_1(\phi_1, \lambda_1)$ and $P_2(\phi_2, \lambda_2)$:

$$\Delta\phi = \text{radians}(\phi_2 - \phi_1)$$
$$\Delta\lambda = \text{radians}(\lambda_2 - \lambda_1)$$
$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\text{radians}(\phi_1)) \cdot \cos(\text{radians}(\phi_2)) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$
$$d = R \cdot c$$

Where:
- $R = 6,371,000\text{ m}$ (mean Earth volumetric radius, IUGG standard)

---

## 3. Metric Calculations

### Total Trip Distance
$$\text{distanceM} = \sum_{i=1}^{N-1} \text{haversine}(P_i, P_{i+1}) \quad (\text{for consecutive valid points})$$

### Total Duration
$$\text{durationS} = \frac{T_{\text{last}} - T_{\text{first}}}{1000}$$

### Moving Time vs. Idle Time
- Moving threshold: $\text{speed} \ge 0.5\text{ m/s}$ ($\approx 1.8\text{ km/h}$).
- Any segment where implied speed is below $0.5\text{ m/s}$ is classified as **idle / stopped time** (e.g. waiting at red lights).
$$\text{movingTimeS} = \sum \Delta t_{\text{moving}}$$
$$\text{idleTimeS} = \text{durationS} - \text{movingTimeS}$$

### Average Speed
$$\text{avgSpeedMps} = \frac{\text{distanceM}}{\text{movingTimeS}} \quad (\text{if } \text{movingTimeS} > 0 \text{ else } 0)$$
*(Note: Driving average speed ignores stopped/idle time to reflect actual driving pace).*

### Top Speed
$$\text{topSpeedMps} = \max(\text{valid point speeds})$$
Subject to spike rejection ($< 100\text{ m/s}$).

---

## 4. Anomaly Thresholds & Anti-Cheat

| Rule | Threshold | Violation Action |
|---|---|---|
| Latitude bounds | $-90^\circ \le \phi \le 90^\circ$ | Reject point (`COORDINATES_OUT_OF_BOUNDS`) |
| Longitude bounds | $-180^\circ \le \lambda \le 180^\circ$ | Reject point (`COORDINATES_OUT_OF_BOUNDS`) |
| GPS Accuracy | Accuracy $\le 50\text{ m}$ | Reject point (`INSUFFICIENT_ACCURACY`) |
| Chronology | $t_{i} > t_{i-1}$ | Reject point (`BACKWARDS_TIMESTAMP`) |
| Implied Velocity | $v = \Delta d / \Delta t \le 100\text{ m/s}$ ($360\text{ km/h}$) | Reject point (`SPEED_TELEPORT`) |
| Implied Acceleration | $a = \|\Delta v\| / \Delta t \le 15\text{ m/s}^2$ ($\approx 1.53g$) | Reject point (`EXCESSIVE_ACCELERATION`) |
| Minimum Points | Count $\ge 3$ valid points | Mark trip `INVALID` (`TOO_FEW_POINTS`) |
| Max Anomaly Ratio | $> 20\%$ suspicious jumps | Mark trip `INVALID` (`EXCESSIVE_ANOMALIES`) |
