import { ChartDefinition } from './types';

export const HEADER_MAPPINGS: Record<string, string[]> = {
    // Power
    'motor_1': ['motor_1', 'motor1', 'Motor1', 'MOTOR1', 'Motor 1'],
    'motor_2': ['motor_2', 'motor2', 'Motor2', 'MOTOR2', 'Motor 2'],
    'motor_3': ['motor_3', 'motor3', 'Motor3', 'MOTOR3', 'Motor 3'],
    'motor_4': ['motor_4', 'motor4', 'Motor4', 'MOTOR4', 'Motor 4'],
    'esc1_current': ['esc1_current', 'esc1_curr', 'ESC1_CURRENT', 'ESC1_CURR', 'esc1 current'],
    'esc2_current': ['esc2_current', 'esc2_curr', 'ESC2_CURRENT', 'ESC2_CURR', 'esc2 current'],
    'esc3_current': ['esc3_current', 'esc3_curr', 'ESC3_CURRENT', 'ESC3_CURR', 'esc3 current'],
    'esc4_current': ['esc4_current', 'esc4_curr', 'ESC4_CURRENT', 'ESC4_CURR', 'esc4 current'],
    'esc1_step_time': ['esc1_step_time', 'esc1_time', 'ESC1_STEP_TIME', 'ESC1_TIME', 'esc1 step time'],
    'esc2_step_time': ['esc2_step_time', 'esc2_time', 'ESC2_STEP_TIME', 'ESC2_TIME', 'esc2 step time'],
    'esc3_step_time': ['esc3_step_time', 'esc3_time', 'ESC3_STEP_TIME', 'ESC3_TIME', 'esc3 step time'],
    'esc4_step_time': ['esc4_step_time', 'esc4_time', 'ESC4_STEP_TIME', 'ESC4_TIME', 'esc4 step time'],
    'esc1_voltage': ['esc1_voltage', 'esc1_volt', 'ESC1_VOLTAGE', 'ESC1_VOLT', 'esc1 voltage'],
    'esc2_voltage': ['esc2_voltage', 'esc2_volt', 'ESC2_VOLTAGE', 'ESC2_VOLT', 'esc2 voltage'],
    'esc3_voltage': ['esc3_voltage', 'esc3_volt', 'ESC3_VOLTAGE', 'ESC3_VOLT', 'esc3 voltage'],
    'esc4_voltage': ['esc4_voltage', 'esc4_volt', 'ESC4_VOLTAGE', 'ESC4_VOLT', 'esc4 voltage'],
    'esc1_temperature': ['esc1_temperature', 'esc1_temp', 'ESC1_TEMPERATURE', 'ESC1_TEMP', 'esc1 temperature'],
    'esc2_temperature': ['esc2_temperature', 'esc2_temp', 'ESC2_TEMPERATURE', 'ESC2_TEMP', 'esc2 temperature'],
    'esc3_temperature': ['esc3_temperature', 'esc3_temp', 'ESC3_TEMPERATURE', 'ESC3_TEMP', 'esc3 temperature'],
    'esc4_temperature': ['esc4_temperature', 'esc4_temp', 'ESC4_TEMPERATURE', 'ESC4_TEMP', 'esc4 temperature'],

    // Flight Control
    'roll': ['roll', 'att_x', 'Roll', 'ATT_X'],
    'pitch': ['pitch', 'att_y', 'Pitch', 'ATT_Y'],
    'yaw': ['yaw', 'att_z', 'Yaw', 'ATT_Z'],
    'fs_act': ['fs_act', 'FS', 'FS_ACT', 'Failsafe', 'failsafe'],
    'error': ['error', 'ERR', 'Error', 'ERROR'],
    'rat_ctrl_cmd_z': ['rat_ctrl_cmd_z', 'rat_ctrl_z', 'RateControlCmdZ'],
    'gyro_x': ['gyro_x', 'gyroX', 'GyroX', 'GYRO_X'],
    'gyro_y': ['gyro_y', 'gyroY', 'GyroY', 'GYRO_Y'],
    'gyro_z': ['gyro_z', 'gyroZ', 'GyroZ', 'GYRO_Z'],
    'feedback_ctrler_vel_x': ['feedback_ctrler_vel_x', 'velX_I', 'feedback_vel_x'],
    'target_ctrler_vel_x': ['target_ctrler_vel_x', 'velX_S', 'target_vel_x'],
    'hori_dop': ['hori_dop', 'HDOP', 'hDOP'],
    'vert_dop': ['vert_dop', 'VDOP', 'vDOP'],
    'altitude': ['altitude', 'alt', 'Altitude'],

    // Impact
    'is_armed': ['is_armed', 'isArmed', 'ARMED', 'armed', 'is_arm'],
    'vibr_x': ['vibr_x', 'vibration_x', 'VibrX', 'VibrationX', 'VIBR_X'],
    'vibr_y': ['vibr_y', 'vibration_y', 'VibrY', 'VibrationY', 'VIBR_Y'],
    'vibr_z': ['vibr_z', 'vibration_z', 'VibrZ', 'VibrationZ', 'VIBR_Z'],

    // Control Input
    'ail_value': ['ail_value', 'AIL', 'Aileron', 'aileron'],
    'ele_value': ['ele_value', 'ELE', 'Elevator', 'elevator'],
    'rud_value': ['rud_value', 'RUD', 'Rudder', 'rudder'],
    'thr_value': ['thr_value', 'THR', 'Throttle', 'throttle'],
    'flight_mode': ['flight_mode', 'FlightMode', 'flightMode', 'mode'],
    'x_velocity': ['x_velocity', 'vel_x', 'velocityX', 'VelX', 'vx'],
    'y_velocity': ['y_velocity', 'vel_y', 'velocityY', 'VelY', 'vy'],
    'z_velocity': ['z_velocity', 'vel_z', 'velocityZ', 'VelZ', 'vz'],
};

export interface DataKeyMetadata {
    label: string;
    unit: string;
    description: string;
    transform?: (value: number) => number;
    isStateful?: boolean;
    statefulTransform?: (value: number, context: { initialAltitude: number }) => number;
}

export const DATA_KEY_METADATA: Record<string, DataKeyMetadata> = {
    // --- Keys requiring transformation ---
    // Attitude & Gyro (Radians to Degrees)
    'roll': {
        label: '滾轉角', unit: '°', description: '將弧度 (radian) 轉換為角度 (degree)',
        transform: (value) => value * 57.3,
    },
    'pitch': {
        label: '俯仰角', unit: '°', description: '將弧度 (radian) 轉換為角度 (degree)',
        transform: (value) => value * 57.3,
    },
    'yaw': {
        label: '偏航角', unit: '°', description: '將弧度 (radian) 轉換為角度 (degree)',
        transform: (value) => value * 57.3,
    },
    'rat_ctrl_cmd_z': {
        label: '速率指令 Z', unit: '°/s', description: '將弧度/秒 (rad/s) 轉換為角度/秒 (deg/s)',
        transform: (value) => value * 57.3,
    },
    'gyro_z': {
        label: '陀螺儀 Z', unit: '°/s', description: '將弧度/秒 (rad/s) 轉換為角度/秒 (deg/s)',
        transform: (value) => value * 57.3,
    },
    'gyro_x': {
        label: '陀螺儀 X', unit: '°/s', description: '將弧度/秒 (rad/s) 轉換為角度/秒 (deg/s)',
        transform: (value) => value * 57.3,
    },
    'gyro_y': {
        label: '陀螺儀 Y', unit: '°/s', description: '將弧度/秒 (rad/s) 轉換為角度/秒 (deg/s)',
        transform: (value) => value * 57.3,
    },
    // RC Input (Normalization to Percentage)
    'ail_value': {
        label: '副翼指令', unit: '%', description: '將原始值 (-0.55 ~ 0.55) 標準化為百分比',
        transform: (value) => (value / 0.55) * 100,
    },
    'ele_value': {
        label: '升降舵指令', unit: '%', description: '將原始值 (-0.55 ~ 0.55) 標準化為百分比',
        transform: (value) => (value / 0.55) * 100,
    },
    'rud_value': {
        label: '方向舵指令', unit: '%', description: '將原始值 (-0.55 ~ 0.55) 標準化為百分比',
        transform: (value) => (value / 0.55) * 100,
    },
    'thr_value': {
        label: '油門指令', unit: '%', description: '將 PWM 值 (10500 ~ 19500) 標準化為百分比，中心點為 15000',
        transform: (value) => ((value - 15000) / 4500) * 100,
    },
    // Altitude (Absolute to Relative)
    'altitude': {
        label: '相對高度', unit: 'm', description: '以首筆有效數據為基準點 0m，計算相對高度',
        isStateful: true,
        statefulTransform: (value, context) => value - context.initialAltitude,
    },

    // --- Keys without transformation (for future UI driving) ---
    'motor_1': { label: '馬達 1', unit: 'PWM', description: '飛控輸出的原始 PWM 指令值' },
    'motor_2': { label: '馬達 2', unit: 'PWM', description: '飛控輸出的原始 PWM 指令值' },
    'motor_3': { label: '馬達 3', unit: 'PWM', description: '飛控輸出的原始 PWM 指令值' },
    'motor_4': { label: '馬達 4', unit: 'PWM', description: '飛控輸出的原始 PWM 指令值' },
    'esc1_current': { label: '電變 1 電流', unit: 'A', description: '電變回傳的電流值' },
    'is_armed': { label: '解鎖狀態', unit: '', description: '飛行器是否解鎖' },
    'vibr_x': { label: '震動 X', unit: 'm/s²', description: 'X 軸向的震動值' },
};


export const ALL_DATA_KEYS = [
    'time', 'unix_time',
    'motor_1', 'motor_2', 'motor_3', 'motor_4',
    'esc1_current', 'esc2_current', 'esc3_current', 'esc4_current',
    'esc1_step_time', 'esc2_step_time', 'esc3_step_time', 'esc4_step_time',
    'esc1_voltage', 'esc2_voltage', 'esc3_voltage', 'esc4_voltage',
    'esc1_temperature', 'esc2_temperature', 'esc3_temperature', 'esc4_temperature',
    'fs_act', 'error', 'rat_ctrl_cmd_z', 'gyro_z', 'gyro_x', 'gyro_y',
    'feedback_ctrler_vel_x', 'target_ctrler_vel_x',
    'hori_dop', 'vert_dop', 'is_armed',
    'vibr_x', 'vibr_y', 'vibr_z',
    'ail_value', 'ele_value', 'rud_value', 'thr_value',
    'flight_mode', 'x_velocity', 'y_velocity', 'z_velocity',
    'longitude', 'latitude', 'altitude',
    'roll', 'pitch', 'yaw'
];

export const CHART_DEFINITIONS: Record<string, ChartDefinition[]> = {
    power: [
        { id: 'motor', title: '馬達轉速(飛控指令)', yLabel: '指令(PWM)', datasets: [
            { key: 'motor_1', label: '馬達 1 (motor_1)' }, { key: 'motor_2', label: '馬達 2 (motor_2)' },
            { key: 'motor_3', label: '馬達 3 (motor_3)' }, { key: 'motor_4', label: '馬達 4 (motor_4)' }
        ]},
        { id: 'current', title: '電變電流 (A)', yLabel: '電流 (A)', datasets: [
            { key: 'esc1_current', label: '電變 1 (esc1_current)' }, { key: 'esc2_current', label: '電變 2 (esc2_current)' },
            { key: 'esc3_current', label: '電變 3 (esc3_current)' }, { key: 'esc4_current', label: '電變 4 (esc4_current)' }
        ]},
        { id: 'esc_time', title: '電變步階時間', yLabel: '狀態', datasets: [
            { key: 'esc1_step_time', label: '電變 1 (esc1_step_time)' }, { key: 'esc2_step_time', label: '電變 2 (esc2_step_time)' },
            { key: 'esc3_step_time', label: '電變 3 (esc3_step_time)' }, { key: 'esc4_step_time', label: '電變 4 (esc4_step_time)' }
        ]},
        { id: 'voltage', title: '電變電壓 (V)', yLabel: '電壓 (V)', datasets: [
            { key: 'esc1_voltage', label: '電變 1 (esc1_voltage)' }, { key: 'esc2_voltage', label: '電變 2 (esc2_voltage)' },
            { key: 'esc3_voltage', label: '電變 3 (esc3_voltage)' }, { key: 'esc4_voltage', label: '電變 4 (esc4_voltage)' }
        ]},
        { id: 'temp', title: '電變溫度 (°C)', yLabel: '溫度 (°C)', datasets: [
            { key: 'esc1_temperature', label: '電變 1 (esc1_temperature)' }, { key: 'esc2_temperature', label: '電變 2 (esc2_temperature)' },
            { key: 'esc3_temperature', label: '電變 3 (esc3_temperature)' }, { key: 'esc4_temperature', label: '電變 4 (esc4_temperature)' }
        ]}
    ],
    flight_control: [
        { id: 'attitude', title: '姿態角度', yLabel: '角度 (°)', datasets: [
            { key: 'roll', label: '滾轉 (roll)' },
            { key: 'pitch', label: '俯仰 (pitch)' },
            { key: 'yaw', label: '偏航 (yaw)' }
        ]},
        { id: 'altitude', title: '高度', yLabel: '相對高度 (m)', datasets: [
            { key: 'altitude', label: '高度 (altitude)' }
        ]},
        { id: 'fs_error', title: '失控保護 & 錯誤', yLabel: '失控保護狀態', yLabelRight: '錯誤碼', isStepped: true, datasets: [
            { key: 'fs_act', label: '失控保護觸發 (fs_act)', yAxisId: 'left' }, { key: 'error', label: '錯誤 (error)', yAxisId: 'right' }
        ]},
        { id: 'yaw_rate', title: '偏航速率控制', yLabel: '速率 (°/s)', datasets: [
            { key: 'rat_ctrl_cmd_z', label: '速率指令 Z (rat_ctrl_cmd_z)' }, { key: 'gyro_z', label: '陀螺儀 Z (gyro_z)' }
        ]},
        { id: 'vel_x', title: 'X軸速度 (目標 vs 反饋)', yLabel: '速度 (m/s)', datasets: [
            { key: 'feedback_ctrler_vel_x', label: '反饋速度 X (feedback_ctrler_vel_x)' }, { key: 'target_ctrler_vel_x', label: '目標速度 X (target_ctrler_vel_x)' }
        ]},
        { id: 'dop', title: 'GPS DOP', yLabel: 'DOP 值', datasets: [
            { key: 'hori_dop', label: '水平 DOP (hori_dop)' }, { key: 'vert_dop', label: '垂直 DOP (vert_dop)' }
        ]}
    ],
    impact: [
         { id: 'fs_error_impact', title: '失控保護 & 錯誤', yLabel: '失控保護狀態', yLabelRight: '錯誤碼', isStepped: true, datasets: [
            { key: 'fs_act', label: '失控保護觸發 (fs_act)', yAxisId: 'left' }, { key: 'error', label: '錯誤 (error)', yAxisId: 'right' }
        ]},
        { id: 'armed', title: '解鎖狀態', yLabel: '狀態', isStepped: true, datasets: [
            { key: 'is_armed', label: '已解鎖 (is_armed)' }
        ]},
        { id: 'vibration', title: '震動', yLabel: 'm/s/s', datasets: [
            { key: 'vibr_x', label: '震動 X (vibr_x)' }, { key: 'vibr_y', label: '震動 Y (vibr_y)' }, { key: 'vibr_z', label: '震動 Z (vibr_z)' }
        ]},
        { id: 'gyro_impact', title: '陀螺儀', yLabel: '速率 (°/s)', datasets: [
            { key: 'gyro_x', label: '陀螺儀 X (gyro_x)' }, { key: 'gyro_y', label: '陀螺儀 Y (gyro_y)' }, { key: 'gyro_z', label: '陀螺儀 Z (gyro_z)' }
        ]}
    ],
    control_input: [
        { id: 'rc_stick', title: '遙控器搖桿輸入', yLabel: '指令 (%)', datasets: [
            { key: 'ail_value', label: '副翼 (ail_value)' }, { key: 'ele_value', label: '升降舵 (ele_value)' },
            { key: 'rud_value', label: '方向舵 (rud_value)' }, { key: 'thr_value', label: '油門 (thr_value)' }
        ]},
        { id: 'flight_mode', title: '飛行模式', yLabel: '模式 ID', isStepped: true, datasets: [
            { key: 'flight_mode', label: '模式 (flight_mode)' }
        ]},
        { id: 'gyro_control', title: '陀螺儀', yLabel: '速率 (°/s)', datasets: [
            { key: 'gyro_x', label: '陀螺儀 X (gyro_x)' }, { key: 'gyro_y', label: '陀螺儀 Y (gyro_y)' }, { key: 'gyro_z', label: '陀螺儀 Z (gyro_z)' }
        ]},
        { id: 'velocity', title: '遙控輸入速度', yLabel: '速度 (m/s)', datasets: [
            { key: 'x_velocity', label: '速度 X (x_velocity)' }, { key: 'y_velocity', label: '速度 Y (y_velocity)' }, { key: 'z_velocity', label: '速度 Z (z_velocity)' }
        ]}
    ]
};

export const DATA_COLORS = [
    '#3b82f6', // blue-500
    '#22c55e', // green-500
    '#f97316', // orange-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#14b8a6', // teal-500
    '#ef4444', // red-500
];