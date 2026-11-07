import React, { useState, useEffect, useRef } from 'react';
import {
  LuPlay,
  LuRotateCcw,
  LuTrash2,
  LuArrowUp,
  LuArrowDown,
  LuPlus,
  LuRocket,
  LuCircleCheck,
  LuCircleX,
  LuFlag,
  LuMagnet,
  LuCompass,
  LuGauge,
  LuCpu,
  LuSparkles,
  LuClipboardList,
  LuWrench
} from 'react-icons/lu';
import { TbRobot } from 'react-icons/tb';

export type VexBlockType =
  | 'drive'
  | 'turn'
  | 'set_drive_velocity'
  | 'stop_driving'
  | 'energize_magnet'
  | 'spin_motor'
  | 'set_motor_velocity'
  | 'wait_seconds'
  | 'wait_bumper';

export interface VexBlockInstance {
  uid: string;
  type: VexBlockType;
  direction?: 'forward' | 'reverse' | 'right' | 'left';
  magnetMode?: 'boost' | 'drop';
  amount?: number;
}

export interface PracticeAssignment {
  id: string;
  title: string;
  description: string;
  startX: number;
  startY: number;
  startHeading: number; // 0: Up, 90: Right, 180: Down, 270: Left
  goalX: number;
  goalY: number;
  hasDisk?: boolean;
  diskX?: number;
  diskY?: number;
  walls?: { x: number; y: number }[];
  requiredBlockTypes?: VexBlockType[];
}

interface VexCodePracticeLabProps {
  lessonId: string;
  lessonOrder: number;
  lessonTitle: string;
  teacherName?: string;
  homeworkNote?: string;
  assignments?: PracticeAssignment[];
  onSubmitAssignment: (summaryCode: string, passed: boolean) => Promise<void>;
}

const DEFAULT_ASSIGNMENTS_BY_ORDER: Record<number, PracticeAssignment[]> = {
  1: [
    {
      id: 'prac-1-1',
      title: 'Đề 1 (Thầy Cô Giao): Khởi động Động cơ & Tiến lên 2 ô (400mm)',
      description:
        'Con hãy lắp khối lệnh quay động cơ (spin motor forward), sau đó cho Robot đi thẳng về phía trước 400mm (2 ô) để tới Ô Đích màu xanh rồi dừng lại (stop driving) nhé!',
      startX: 0,
      startY: 2,
      startHeading: 90,
      goalX: 2,
      goalY: 2,
      requiredBlockTypes: ['spin_motor', 'drive', 'stop_driving']
    },
    {
      id: 'prac-1-2',
      title: 'Đề 2 (Thầy Cô Giao): Tiến lên rồi Lùi về vị trí Đích',
      description:
        'Robot đang ở ô (1, 2). Con hãy thử dùng lệnh drive reverse (đi lùi) 200mm hoặc drive forward để đưa Robot tới Ô Đích (3, 2) nhé!',
      startX: 1,
      startY: 2,
      startHeading: 90,
      goalX: 3,
      goalY: 2,
      requiredBlockTypes: ['drive']
    }
  ],
  2: [
    {
      id: 'prac-2-1',
      title: 'Đề 1 (Thầy Cô Giao): Tăng Vận Tốc 80% & Đợi 1 Giây',
      description:
        'Hãy đặt vận tốc di chuyển (set drive velocity to 80%), đi thẳng 600mm (3 ô), đợi 1 giây (wait 1 seconds) rồi dừng tại Ô Đích (3, 2)!',
      startX: 0,
      startY: 2,
      startHeading: 90,
      goalX: 3,
      goalY: 2,
      requiredBlockTypes: ['set_drive_velocity', 'drive', 'wait_seconds']
    }
  ],
  3: [
    {
      id: 'prac-3-1',
      title: 'Đề 1 (Thầy Cô Giao): Rẽ Phải 90 Độ Vượt Góc Cua',
      description:
        'Robot xuất phát tại (1, 3) hướng lên trên (0°). Hãy đi thẳng 400mm lên ô (1, 1), sau đó xoay phải 90 độ (turn right for 90 degrees) và đi thẳng 400mm tới Ô Đích (3, 1)!',
      startX: 1,
      startY: 3,
      startHeading: 0,
      goalX: 3,
      goalY: 1,
      walls: [
        { x: 2, y: 2 },
        { x: 2, y: 3 }
      ],
      requiredBlockTypes: ['drive', 'turn']
    }
  ],
  4: [
    {
      id: 'prac-4-1',
      title: 'Đề 1 (Thầy Cô Giao): Bật Nam Châm (Magnet Boost) Hút Đĩa Về Đích',
      description:
        'Trên sân có 1 Đĩa kim loại ở ô (2, 2). Con hãy bật nam châm hút (energize Magnet to boost), đi thẳng qua ô (2, 2) để hút đĩa, đi tiếp tới Ô Đích (4, 2) rồi nhả đĩa ra (energize Magnet to drop) nhé!',
      startX: 0,
      startY: 2,
      startHeading: 90,
      goalX: 4,
      goalY: 2,
      hasDisk: true,
      diskX: 2,
      diskY: 2,
      requiredBlockTypes: ['energize_magnet', 'drive']
    }
  ],
  5: [
    {
      id: 'prac-5-1',
      title: 'Đề Tổng Hợp (Thầy Cô Giao): Vượt Chướng Ngại Vật & Thu Thập Nam Châm',
      description:
        'Hãy đặt vận tốc (set drive velocity), bật nam châm (energize Magnet to boost), điều khiển Robot đi lấy Đĩa kim loại tại (1, 1), rẽ phải 90 độ và đưa đĩa về Ô Đích (3, 1) rồi thả xuống (drop)!',
      startX: 1,
      startY: 3,
      startHeading: 0,
      goalX: 3,
      goalY: 1,
      hasDisk: true,
      diskX: 1,
      diskY: 1,
      walls: [{ x: 2, y: 2 }],
      requiredBlockTypes: ['energize_magnet', 'drive', 'turn']
    }
  ]
};

const TOOLBOX_CATEGORIES: {
  category: string;
  color: string;
  blocks: {
    type: VexBlockType;
    label: string;
    sub: string;
    defaultProps: Partial<VexBlockInstance>;
  }[];
}[] = [
  {
    category: 'Drivetrain (Di chuyển & Xoay)',
    color: '#2563eb',
    blocks: [
      {
        type: 'drive',
        label: 'drive [forward] for [200] mm',
        sub: 'Đi tiến / đi lùi (200mm = 1 ô)',
        defaultProps: { direction: 'forward', amount: 200 }
      },
      {
        type: 'turn',
        label: 'turn [right] for [90] degrees',
        sub: 'Xoay phải / xoay trái theo độ',
        defaultProps: { direction: 'right', amount: 90 }
      },
      {
        type: 'set_drive_velocity',
        label: 'set drive velocity to [50] %',
        sub: 'Đặt vận tốc chạy nhanh / chậm',
        defaultProps: { amount: 50 }
      },
      {
        type: 'stop_driving',
        label: 'stop driving',
        sub: 'Dừng xe Robot lại',
        defaultProps: {}
      }
    ]
  },
  {
    category: 'Magnet (Nam châm điện)',
    color: '#7c3aed',
    blocks: [
      {
        type: 'energize_magnet',
        label: 'energize Magnet to [boost]',
        sub: 'Bật hút (boost) / Nhả (drop) vật thể',
        defaultProps: { magnetMode: 'boost' }
      }
    ]
  },
  {
    category: 'Motor (Động cơ rời)',
    color: '#0284c7',
    blocks: [
      {
        type: 'spin_motor',
        label: 'spin Motor [forward] for [90] degrees',
        sub: 'Quay tròn động cơ tiến / lùi',
        defaultProps: { direction: 'forward', amount: 90 }
      },
      {
        type: 'set_motor_velocity',
        label: 'set Motor velocity to [50] %',
        sub: 'Đặt tốc độ quay động cơ',
        defaultProps: { amount: 50 }
      }
    ]
  },
  {
    category: 'Control & Sensing (Điều khiển & Cảm biến)',
    color: '#d97706',
    blocks: [
      {
        type: 'wait_seconds',
        label: 'wait [1] seconds',
        sub: 'Đợi theo số giây',
        defaultProps: { amount: 1 }
      },
      {
        type: 'wait_bumper',
        label: 'wait until <LED Bumper pressed?>',
        sub: 'Đợi đến khi cảm biến mũi xe chạm',
        defaultProps: {}
      }
    ]
  }
];

function getBlockColor(type: VexBlockType): string {
  switch (type) {
    case 'drive':
    case 'turn':
    case 'set_drive_velocity':
    case 'stop_driving':
      return '#2563eb';
    case 'energize_magnet':
      return '#7c3aed';
    case 'spin_motor':
    case 'set_motor_velocity':
      return '#0284c7';
    case 'wait_seconds':
    case 'wait_bumper':
      return '#d97706';
  }
}

export const VexCodePracticeLab: React.FC<VexCodePracticeLabProps> = ({
  lessonId,
  lessonOrder,
  lessonTitle,
  teacherName,
  homeworkNote,
  assignments,
  onSubmitAssignment
}) => {
  const effectiveAssignments: PracticeAssignment[] =
    assignments && assignments.length > 0
      ? assignments
      : DEFAULT_ASSIGNMENTS_BY_ORDER[lessonOrder] || DEFAULT_ASSIGNMENTS_BY_ORDER[1];

  const [selectedModeId, setSelectedModeId] = useState<string>(
    effectiveAssignments[0]?.id || 'sandbox'
  );

  // Sync when lesson changes
  useEffect(() => {
    const list =
      assignments && assignments.length > 0
        ? assignments
        : DEFAULT_ASSIGNMENTS_BY_ORDER[lessonOrder] || DEFAULT_ASSIGNMENTS_BY_ORDER[1];
    setSelectedModeId(list[0]?.id || 'sandbox');
    setProgramBlocks([]);
    setEvalResult(null);
  }, [lessonId, lessonOrder, assignments]);

  const activeAssignment: PracticeAssignment =
    effectiveAssignments.find(a => a.id === selectedModeId) || {
      id: 'sandbox',
      title: 'Chế độ Luyện Tập Tự Do (Sandbox 2D)',
      description:
        'Con có thể tự do thêm các khối lệnh VEXcode GO ở cột bên trái và bấm "Chạy Thử Robot" để quan sát Robot di chuyển trên sa bàn 2D!',
      startX: 0,
      startY: 2,
      startHeading: 90,
      goalX: 4,
      goalY: 2,
      hasDisk: true,
      diskX: 2,
      diskY: 2
    };

  // Program workspace state
  const [programBlocks, setProgramBlocks] = useState<VexBlockInstance[]>([]);
  const [activeBlockIdx, setActiveBlockIdx] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // 2D Robot Simulation State (Grid 5x5: x from 0..4, y from 0..4)
  const [robotX, setRobotX] = useState<number>(activeAssignment.startX);
  const [robotY, setRobotY] = useState<number>(activeAssignment.startY);
  const [robotHeading, setRobotHeading] = useState<number>(activeAssignment.startHeading);
  const [driveVelocity, setDriveVelocity] = useState<number>(50);
  const [motorDegrees, setMotorDegrees] = useState<number>(0);
  const [magnetState, setMagnetState] = useState<'boost' | 'drop'>('drop');
  const [carryingDisk, setCarryingDisk] = useState<boolean>(false);
  const [diskPos, setDiskPos] = useState<{ x: number; y: number } | null>(
    activeAssignment.hasDisk
      ? { x: activeAssignment.diskX ?? 2, y: activeAssignment.diskY ?? 2 }
      : null
  );
  const [bumperPressed, setBumperPressed] = useState<boolean>(false);
  const [trailPoints, setTrailPoints] = useState<{ x: number; y: number }[]>([
    { x: activeAssignment.startX, y: activeAssignment.startY }
  ]);
  const [evalResult, setEvalResult] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);

  const cancelRunRef = useRef<boolean>(false);

  const resetPlaygroundToStart = (assign: PracticeAssignment = activeAssignment) => {
    cancelRunRef.current = true;
    setIsRunning(false);
    setActiveBlockIdx(null);
    setRobotX(assign.startX);
    setRobotY(assign.startY);
    setRobotHeading(assign.startHeading);
    setDriveVelocity(50);
    setMotorDegrees(0);
    setMagnetState('drop');
    setCarryingDisk(false);
    setBumperPressed(false);
    setDiskPos(
      assign.hasDisk ? { x: assign.diskX ?? 2, y: assign.diskY ?? 2 } : null
    );
    setTrailPoints([{ x: assign.startX, y: assign.startY }]);
  };

  useEffect(() => {
    resetPlaygroundToStart(activeAssignment);
    setEvalResult(null);
  }, [selectedModeId, lessonId]);

  const handleAddBlock = (
    type: VexBlockType,
    defaultProps: Partial<VexBlockInstance>
  ) => {
    const newBlock: VexBlockInstance = {
      uid: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      ...defaultProps
    };
    setProgramBlocks(prev => [...prev, newBlock]);
    setEvalResult(null);
  };

  const handleUpdateBlock = (
    uid: string,
    patch: Partial<VexBlockInstance>
  ) => {
    setProgramBlocks(prev =>
      prev.map(b => (b.uid === uid ? { ...b, ...patch } : b))
    );
    setEvalResult(null);
  };

  const handleMoveBlock = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= programBlocks.length) return;
    const copy = [...programBlocks];
    const temp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = temp;
    setProgramBlocks(copy);
  };

  const handleRemoveBlock = (uid: string) => {
    setProgramBlocks(prev => prev.filter(b => b.uid !== uid));
    setEvalResult(null);
  };

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Execute the visual blocks step-by-step on the 2D Playground
  const runSimulation = async (checkGradeAfterRun: boolean) => {
    if (programBlocks.length === 0) {
      setEvalResult({
        passed: false,
        message:
          'Con chưa ghép khối lệnh nào vào dưới "when started"! Hãy bấm chọn khối lệnh ở cột bên trái nhé.'
      });
      return;
    }

    resetPlaygroundToStart(activeAssignment);
    await sleep(80);
    cancelRunRef.current = false;
    setIsRunning(true);
    setEvalResult(null);

    let curX = activeAssignment.startX;
    let curY = activeAssignment.startY;
    let curHeading = activeAssignment.startHeading; // 0: Up, 90: Right, 180: Down, 270: Left
    let curVel = 50;
    let curMagnet: 'boost' | 'drop' = 'drop';
    let hasDiskNow = false;
    let curDiskPos = activeAssignment.hasDisk
      ? { x: activeAssignment.diskX ?? 2, y: activeAssignment.diskY ?? 2 }
      : null;
    const walls = activeAssignment.walls || [];

    const isWall = (gx: number, gy: number) =>
      gx < 0 || gx > 4 || gy < 0 || gy > 4 || walls.some(w => w.x === gx && w.y === gy);

    for (let i = 0; i < programBlocks.length; i++) {
      if (cancelRunRef.current) break;
      const blk = programBlocks[i];
      setActiveBlockIdx(i);

      const stepDelay = Math.max(220, Math.round(520 - (curVel / 100) * 260));

      if (blk.type === 'set_drive_velocity') {
        curVel = Math.min(100, Math.max(10, Number(blk.amount) || 50));
        setDriveVelocity(curVel);
        await sleep(250);
      } else if (blk.type === 'set_motor_velocity') {
        await sleep(250);
      } else if (blk.type === 'spin_motor') {
        const deg = Number(blk.amount) || 90;
        const delta = blk.direction === 'reverse' ? -deg : deg;
        setMotorDegrees(prev => prev + delta);
        await sleep(320);
      } else if (blk.type === 'energize_magnet') {
        curMagnet = blk.magnetMode || 'boost';
        setMagnetState(curMagnet);
        if (
          curMagnet === 'boost' &&
          curDiskPos &&
          curDiskPos.x === curX &&
          curDiskPos.y === curY
        ) {
          hasDiskNow = true;
          setCarryingDisk(true);
        } else if (curMagnet === 'drop' && hasDiskNow) {
          hasDiskNow = false;
          setCarryingDisk(false);
          curDiskPos = { x: curX, y: curY };
          setDiskPos({ x: curX, y: curY });
        }
        await sleep(300);
      } else if (blk.type === 'turn') {
        const deg = Number(blk.amount) || 90;
        const delta = blk.direction === 'left' ? -deg : deg;
        curHeading = (curHeading + delta + 3600) % 360;
        setRobotHeading(curHeading);
        await sleep(340);
      } else if (blk.type === 'drive') {
        const mm = Number(blk.amount) || 200;
        const cells = Math.max(1, Math.round(mm / 200));
        const sign = blk.direction === 'reverse' ? -1 : 1;

        for (let step = 0; step < cells; step++) {
          if (cancelRunRef.current) break;
          let dx = 0;
          let dy = 0;
          const normH = ((curHeading % 360) + 360) % 360;
          if (normH === 0) dy = -1 * sign;
          else if (normH === 90) dx = 1 * sign;
          else if (normH === 180) dy = 1 * sign;
          else if (normH === 270) dx = -1 * sign;

          const nextX = curX + dx;
          const nextY = curY + dy;

          if (isWall(nextX, nextY)) {
            setBumperPressed(true);
            await sleep(300);
            break;
          } else {
            setBumperPressed(false);
            curX = nextX;
            curY = nextY;
            setRobotX(curX);
            setRobotY(curY);
            setTrailPoints(prev => [...prev, { x: curX, y: curY }]);

            if (
              curMagnet === 'boost' &&
              !hasDiskNow &&
              curDiskPos &&
              curDiskPos.x === curX &&
              curDiskPos.y === curY
            ) {
              hasDiskNow = true;
              setCarryingDisk(true);
            }
            if (hasDiskNow) {
              curDiskPos = { x: curX, y: curY };
              setDiskPos({ x: curX, y: curY });
            }
            await sleep(stepDelay);
          }
        }
      } else if (blk.type === 'wait_seconds') {
        const secs = Math.min(5, Math.max(1, Number(blk.amount) || 1));
        await sleep(secs * 450);
      } else if (blk.type === 'wait_bumper') {
        await sleep(300);
      } else if (blk.type === 'stop_driving') {
        await sleep(220);
        break;
      }
    }

    setActiveBlockIdx(null);
    setIsRunning(false);

    // Check if the robot completed the teacher's assignment
    const reachedGoal =
      curX === activeAssignment.goalX && curY === activeAssignment.goalY;
    const diskDelivered =
      !activeAssignment.hasDisk ||
      (curDiskPos !== null &&
        curDiskPos.x === activeAssignment.goalX &&
        curDiskPos.y === activeAssignment.goalY);

    const usedTypes = new Set(programBlocks.map(b => b.type));
    const missingTypes = (activeAssignment.requiredBlockTypes || []).filter(
      t => !usedTypes.has(t)
    );

    const passed = reachedGoal && diskDelivered && missingTypes.length === 0;

    let msg = '';
    if (passed) {
      msg = `XUẤT SẮC! Robot đã hoàn thành chính xác "${activeAssignment.title}" và đến đúng Ô Đích (${activeAssignment.goalX}, ${activeAssignment.goalY})!`;
    } else if (!reachedGoal) {
      msg = `Robot đang dừng ở ô (${curX}, ${curY}), chưa tới Ô Đích (${activeAssignment.goalX}, ${activeAssignment.goalY}). Con hãy chỉnh lại số mm (1 ô = 200mm) hoặc hướng xoay nhé!`;
    } else if (!diskDelivered) {
      msg = `Robot đã tới Đích nhưng chưa mang Đĩa kim loại về Đích! Con nhớ bật "energize Magnet to boost" trước khi đi qua Đĩa nhé!`;
    } else if (missingTypes.length > 0) {
      msg = `Robot đã tới Đích, nhưng đề bài của thầy cô yêu cầu sử dụng thêm khối lệnh: ${missingTypes.join(
        ', '
      )}!`;
    }

    setEvalResult({ passed, message: msg });

    if (checkGradeAfterRun) {
      const codeText = [
        `// Bài nộp Thực hành VEXcode GO 2D - ${lessonTitle}`,
        `// Đề thực hành: ${activeAssignment.title}`,
        `when started:`,
        ...programBlocks.map((b, i) => `  ${i + 1}. ${formatBlockText(b)}`),
        `// Kết quả Robot: Dừng tại ô (${curX}, ${curY}) - Đích (${activeAssignment.goalX}, ${activeAssignment.goalY}) -> ${
          passed ? 'ĐẠT (PASSED)' : 'CHƯA ĐẠT'
        }`
      ].join('\n');

      await onSubmitAssignment(codeText, passed);
    }
  };

  return (
    <div className="vex-lab-wrapper">
      {/* Thanh chọn Đề Thực Hành / Bài Tập Về Nhà Thầy Cô Giao */}
      <div className="vex-assignments-bar">
        <div className="vex-assignments-top">
          <div className="vex-assignments-label">
            <LuClipboardList size={18} color="#fb923c" />
            <span>
              BÀI TẬP VỀ NHÀ &amp; ĐỀ THỰC HÀNH ({effectiveAssignments.length} đề)
              {teacherName ? ` • GV: ${teacherName}` : ''}:
            </span>
          </div>

          <div className="vex-assignments-pills">
            {effectiveAssignments.map((assign, idx) => (
              <button
                key={assign.id}
                type="button"
                className={`vex-assign-pill ${
                  selectedModeId === assign.id ? 'active' : ''
                }`}
                onClick={() => setSelectedModeId(assign.id)}
              >
                <LuFlag size={14} />
                <span>
                  Đề {idx + 1}: {assign.title.replace(/^Đề \d+\s*\([^)]*\):\s*/i, '')}
                </span>
              </button>
            ))}

            <button
              type="button"
              className={`vex-assign-pill sandbox ${
                selectedModeId === 'sandbox' ? 'active' : ''
              }`}
              onClick={() => setSelectedModeId('sandbox')}
            >
              <LuWrench size={14} />
              <span>Luyện Tập Tự Do</span>
            </button>
          </div>
        </div>

        <div className="vex-assignment-prompt-box">
          <div className="vex-assignment-prompt-text">
            <strong>{activeAssignment.title}:</strong> {activeAssignment.description}
            {homeworkNote && (
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 6,
                  borderTop: '1px dashed #334155',
                  color: '#38bdf8',
                  fontSize: '0.84rem'
                }}
              >
                <strong>Dặn dò BTVN của {teacherName || 'Giáo viên'}:</strong> {homeworkNote}
              </div>
            )}
          </div>
          <div className="vex-assignment-goal-tag">
            <span>Xuất phát: ({activeAssignment.startX}, {activeAssignment.startY})</span>
            <span>&rarr;</span>
            <span style={{ color: '#34d399' }}>
              Ô Đích: ({activeAssignment.goalX}, {activeAssignment.goalY})
            </span>
          </div>
        </div>
      </div>

      {/* Bố cục 3 cột chuẩn codego.vex.com */}
      <div className="vex-three-cols">
        {/* CỘT 1: KHAY KHỐI LỆNH VEXCODE GO (TOOLBOX) */}
        <div className="vex-toolbox-col">
          <div className="vex-col-header">
            <LuCpu size={16} color="#38bdf8" />
            <span>1. Khay Khối Lệnh VEXcode</span>
          </div>
          <div className="vex-toolbox-scroll">
            {TOOLBOX_CATEGORIES.map(cat => (
              <div key={cat.category} className="vex-cat-group">
                <div className="vex-cat-title" style={{ borderLeftColor: cat.color }}>
                  {cat.category}
                </div>
                <div className="vex-cat-blocks">
                  {cat.blocks.map(b => (
                    <button
                      key={b.type}
                      type="button"
                      className="vex-palette-block"
                      style={{ background: cat.color }}
                      onClick={() => handleAddBlock(b.type, b.defaultProps)}
                    >
                      <div className="vex-palette-block-main">
                        <LuPlus size={14} />
                        <span>{b.label}</span>
                      </div>
                      <div className="vex-palette-block-sub">{b.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT 2: VÙNG LẮP GHÉP KHỐI LỆNH (WORKSPACE) */}
        <div className="vex-workspace-col">
          <div className="vex-col-header">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <LuSparkles size={16} color="#fbbf24" />
              <span>2. Bàn Lắp Ghép Khối Lệnh ({programBlocks.length} khối)</span>
            </div>
            {programBlocks.length > 0 && (
              <button
                type="button"
                className="vex-clear-btn"
                onClick={() => {
                  setProgramBlocks([]);
                  resetPlaygroundToStart(activeAssignment);
                  setEvalResult(null);
                }}
              >
                <LuTrash2 size={13} />
                <span>Xóa hết</span>
              </button>
            )}
          </div>

          <div className="vex-workspace-canvas">
            {/* Khối mũ When Started chuẩn VEXcode GO */}
            <div className="vex-hat-when-started">
              <LuPlay size={16} />
              <span>when started (Khi bắt đầu chạy)</span>
            </div>

            {programBlocks.length === 0 ? (
              <div className="vex-empty-workspace-hint">
                Bấm vào các khối lệnh ở cột <b>Khay Khối Lệnh</b> bên trái để ghép nối tiếp vào dưới khối <b>when started</b> nhé!
              </div>
            ) : (
              <div className="vex-stack-list">
                {programBlocks.map((blk, idx) => {
                  const bg = getBlockColor(blk.type);
                  const isCurrentRunning = activeBlockIdx === idx;
                  return (
                    <div
                      key={blk.uid}
                      className={`vex-stack-block ${isCurrentRunning ? 'running' : ''}`}
                      style={{ background: bg }}
                    >
                      <span className="vex-step-index">{idx + 1}</span>

                      <div className="vex-block-inline-fields">
                        {blk.type === 'drive' && (
                          <>
                            <span>drive</span>
                            <select
                              className="vex-block-select"
                              value={blk.direction || 'forward'}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  direction: e.target.value as 'forward' | 'reverse'
                                })
                              }
                            >
                              <option value="forward">forward (tiến)</option>
                              <option value="reverse">reverse (lùi)</option>
                            </select>
                            <span>for</span>
                            <select
                              className="vex-block-select"
                              value={blk.amount || 200}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  amount: Number(e.target.value)
                                })
                              }
                            >
                              <option value={200}>200 mm (1 ô)</option>
                              <option value={400}>400 mm (2 ô)</option>
                              <option value={600}>600 mm (3 ô)</option>
                              <option value={800}>800 mm (4 ô)</option>
                            </select>
                          </>
                        )}

                        {blk.type === 'turn' && (
                          <>
                            <span>turn</span>
                            <select
                              className="vex-block-select"
                              value={blk.direction || 'right'}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  direction: e.target.value as 'right' | 'left'
                                })
                              }
                            >
                              <option value="right">right (phải)</option>
                              <option value="left">left (trái)</option>
                            </select>
                            <span>for</span>
                            <select
                              className="vex-block-select"
                              value={blk.amount || 90}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  amount: Number(e.target.value)
                                })
                              }
                            >
                              <option value={90}>90 degrees</option>
                              <option value={180}>180 degrees</option>
                              <option value={270}>270 degrees</option>
                            </select>
                          </>
                        )}

                        {blk.type === 'set_drive_velocity' && (
                          <>
                            <span>set drive velocity to</span>
                            <select
                              className="vex-block-select"
                              value={blk.amount || 50}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  amount: Number(e.target.value)
                                })
                              }
                            >
                              <option value={25}>25 %</option>
                              <option value={50}>50 %</option>
                              <option value={80}>80 %</option>
                              <option value={100}>100 %</option>
                            </select>
                          </>
                        )}

                        {blk.type === 'stop_driving' && (
                          <span>stop driving (dừng lại)</span>
                        )}

                        {blk.type === 'energize_magnet' && (
                          <>
                            <span>energize Magnet to</span>
                            <select
                              className="vex-block-select"
                              value={blk.magnetMode || 'boost'}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  magnetMode: e.target.value as 'boost' | 'drop'
                                })
                              }
                            >
                              <option value="boost">boost (hút)</option>
                              <option value="drop">drop (thả)</option>
                            </select>
                          </>
                        )}

                        {blk.type === 'spin_motor' && (
                          <>
                            <span>spin Motor</span>
                            <select
                              className="vex-block-select"
                              value={blk.direction || 'forward'}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  direction: e.target.value as 'forward' | 'reverse'
                                })
                              }
                            >
                              <option value="forward">forward</option>
                              <option value="reverse">reverse</option>
                            </select>
                            <span>for</span>
                            <select
                              className="vex-block-select"
                              value={blk.amount || 90}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  amount: Number(e.target.value)
                                })
                              }
                            >
                              <option value={90}>90 degrees</option>
                              <option value={180}>180 degrees</option>
                              <option value={360}>360 degrees</option>
                            </select>
                          </>
                        )}

                        {blk.type === 'set_motor_velocity' && (
                          <>
                            <span>set Motor velocity to</span>
                            <select
                              className="vex-block-select"
                              value={blk.amount || 50}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  amount: Number(e.target.value)
                                })
                              }
                            >
                              <option value={50}>50 %</option>
                              <option value={80}>80 %</option>
                              <option value={100}>100 %</option>
                            </select>
                          </>
                        )}

                        {blk.type === 'wait_seconds' && (
                          <>
                            <span>wait</span>
                            <select
                              className="vex-block-select"
                              value={blk.amount || 1}
                              onChange={e =>
                                handleUpdateBlock(blk.uid, {
                                  amount: Number(e.target.value)
                                })
                              }
                            >
                              <option value={1}>1 seconds</option>
                              <option value={2}>2 seconds</option>
                              <option value={3}>3 seconds</option>
                            </select>
                          </>
                        )}

                        {blk.type === 'wait_bumper' && (
                          <span>wait until &lt;LED Bumper pressed?&gt;</span>
                        )}
                      </div>

                      <div className="vex-block-item-actions">
                        <button
                          type="button"
                          title="Di chuyển lên"
                          disabled={idx === 0}
                          onClick={() => handleMoveBlock(idx, -1)}
                        >
                          <LuArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          title="Di chuyển xuống"
                          disabled={idx === programBlocks.length - 1}
                          onClick={() => handleMoveBlock(idx, 1)}
                        >
                          <LuArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          title="Xóa khối này"
                          onClick={() => handleRemoveBlock(blk.uid)}
                        >
                          <LuTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CỘT 3: SA BÀN MÔ PHỎNG ROBOT 2D (2D VIRTUAL PLAYGROUND) */}
        <div className="vex-stage-col">
          <div className="vex-col-header">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <TbRobot size={18} color="#fb923c" />
              <span>3. Sa Bàn VEX GO 2D (1 ô = 200mm)</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="vex-stage-btn reset"
                onClick={() => {
                  resetPlaygroundToStart(activeAssignment);
                  setEvalResult(null);
                }}
              >
                <LuRotateCcw size={13} />
                <span>Đặt lại sân</span>
              </button>
              <button
                type="button"
                className="vex-stage-btn run"
                disabled={isRunning}
                onClick={() => runSimulation(false)}
              >
                <LuPlay size={13} />
                <span>{isRunning ? 'Đang chạy...' : 'Chạy thử'}</span>
              </button>
            </div>
          </div>

          {/* Đồng hồ cảm biến 2D */}
          <div className="vex-telemetry-strip">
            <span>
              <LuCompass size={13} color="#38bdf8" /> Ô: ({robotX}, {robotY}) • Góc:{' '}
              {robotHeading}°
            </span>
            <span>
              <LuGauge size={13} color="#fb923c" /> Vận tốc: {driveVelocity}%
            </span>
            <span>
              <LuMagnet size={13} color="#c084fc" /> Magnet:{' '}
              {magnetState === 'boost' ? 'BOOST (Hút)' : 'DROP'}
            </span>
          </div>

          {/* Bản đồ 2D 5x5 */}
          <div className="vex-grid-stage-box">
            <div className="vex-grid-5x5">
              {Array.from({ length: 25 }).map((_, i) => {
                const gx = i % 5;
                const gy = Math.floor(i / 5);
                const isStart =
                  gx === activeAssignment.startX && gy === activeAssignment.startY;
                const isGoal =
                  gx === activeAssignment.goalX && gy === activeAssignment.goalY;
                const isWall = (activeAssignment.walls || []).some(
                  w => w.x === gx && w.y === gy
                );
                const hasDiskHere =
                  diskPos && diskPos.x === gx && diskPos.y === gy && !carryingDisk;
                const isVisited = trailPoints.some(p => p.x === gx && p.y === gy);

                return (
                  <div
                    key={`${gx}-${gy}`}
                    className={`vex-grid-cell ${isWall ? 'wall' : ''} ${
                      isGoal ? 'goal' : ''
                    } ${isVisited ? 'visited' : ''}`}
                  >
                    <span className="vex-cell-coord">
                      ({gx},{gy})
                    </span>

                    {isStart && <span className="vex-cell-badge start">START</span>}
                    {isGoal && (
                      <div className="vex-goal-marker">
                        <LuFlag size={22} color="#34d399" />
                        <span>ĐÍCH</span>
                      </div>
                    )}
                    {isWall && <div className="vex-wall-block">TƯỜNG</div>}
                    {hasDiskHere && (
                      <div className="vex-disk-object" title="Đĩa kim loại (Object)">
                        <LuMagnet size={18} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Mô hình Robot VEX GO 2D di chuyển mượt trên lưới */}
              <div
                className={`vex-robot-2d-sprite ${
                  magnetState === 'boost' ? 'magnet-on' : ''
                } ${bumperPressed ? 'bumper-hit' : ''}`}
                style={{
                  left: `${robotX * 20}%`,
                  top: `${robotY * 20}%`,
                  transform: `rotate(${robotHeading}deg)`
                }}
              >
                <svg viewBox="0 0 64 64" width="46" height="46">
                  {/* 4 Bánh xe VEX GO */}
                  <rect x="6" y="8" width="10" height="16" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="48" y="8" width="10" height="16" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="6" y="40" width="10" height="16" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="48" y="40" width="10" height="16" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                  {/* Cản trước LED Bumper */}
                  <rect
                    x="16"
                    y="4"
                    width="32"
                    height="6"
                    rx="3"
                    fill={bumperPressed ? '#ef4444' : '#10b981'}
                  />
                  {/* Thân Robot VEX GO màu cam */}
                  <rect
                    x="14"
                    y="10"
                    width="36"
                    height="44"
                    rx="8"
                    fill="#f97316"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {/* Mũi tên chỉ hướng phía trước (Forward) */}
                  <polygon points="32,14 23,26 41,26" fill="#ffffff" />
                  {/* Tâm Nam châm Magnet */}
                  <circle
                    cx="32"
                    cy="38"
                    r="9"
                    fill={carryingDisk ? '#a855f7' : magnetState === 'boost' ? '#6366f1' : '#0f172a'}
                    stroke="#e2e8f0"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Thông báo kết quả kiểm tra */}
          {evalResult && (
            <div
              className={`vex-eval-banner ${
                evalResult.passed ? 'passed' : 'failed'
              }`}
            >
              {evalResult.passed ? (
                <LuCircleCheck size={20} />
              ) : (
                <LuCircleX size={20} />
              )}
              <span>{evalResult.message}</span>
            </div>
          )}

          {/* Nút Nộp bài đề thầy cô giao */}
          <button
            type="button"
            className="vex-submit-practice-btn"
            disabled={isRunning}
            onClick={() => runSimulation(true)}
          >
            <LuRocket size={18} />
            <span>CHẠY &amp; NỘP BÀI THỰC HÀNH CHO THẦY CÔ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function formatBlockText(b: VexBlockInstance): string {
  switch (b.type) {
    case 'drive':
      return `drive ${b.direction || 'forward'} for ${b.amount || 200} mm`;
    case 'turn':
      return `turn ${b.direction || 'right'} for ${b.amount || 90} degrees`;
    case 'set_drive_velocity':
      return `set drive velocity to ${b.amount || 50}%`;
    case 'stop_driving':
      return `stop driving`;
    case 'energize_magnet':
      return `energize Magnet to ${b.magnetMode || 'boost'}`;
    case 'spin_motor':
      return `spin Motor ${b.direction || 'forward'} for ${b.amount || 90} degrees`;
    case 'set_motor_velocity':
      return `set Motor velocity to ${b.amount || 50}%`;
    case 'wait_seconds':
      return `wait ${b.amount || 1} seconds`;
    case 'wait_bumper':
      return `wait until <LED Bumper pressed?>`;
  }
}
