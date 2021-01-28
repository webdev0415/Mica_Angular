import { AnimationTriggerMetadata } from '@angular/animations';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes
} from '@angular/animations';
import { svgDimensions } from './mappings/images';

// export const perspectiveAnimate = trigger(
//   "perspective",
//   [
//     state("left", style({
//       transform: `
//         translate(
//           0,
//           ${svgConfig.height - (svgConfig.bodyHeight / 2)}px)
//         scale(0.5)`,
//       opacity: 0.5
//     })),
//     state("right", style({
//       transform: `
//         translate(
//           ${svgConfig.width - (svgConfig.bodyWidth / 2)}px,
//           ${svgConfig.height - (svgConfig.bodyHeight / 2)}px)
//         scale(0.5)`,
//       opacity: 0.5
//     })),
//     state("centre", style({
//       transform: `translate(${(svgConfig.width / 2) - (svgConfig.bodyWidth / 2)}px, 0) scale(1)`,
//       opacity: 1
//     })),
//     transition("* => centre", animate("600ms ease-out")),
//     transition("centre => *", animate("600ms ease-in"))
//   ]
// );

export const fadeIn: AnimationTriggerMetadata = trigger(
  'fadeIn', [
    state('in', style({opacity: 1})),
    transition(':enter', [
      style({opacity: 0}),
      animate('1s ease-out')
    ]),
    transition(':leave', [
      animate('500ms ease-in', style({opacity: 0}))
    ])
  ]
);

export const perspectiveAnimate: AnimationTriggerMetadata = trigger(
  'perspective', [
    state('left', style({
      transform: 'translate(0, 0) scale(1)',
      height: '100px',
      width: '50px',
      opacity: 0.5
    })),
    state('right', style({
      transform: 'translate(200px, 0) scale(1)',
      height: '100px',
      width: '50px',
      opacity: 0.5
    })),
    state('centre', style({
      transform: `translate(17.5px, 100px) scale(1)`,
      height: '500px',
      width: '215px',
      opacity: 1
    })),
    state('front/Left Leg', style({
      transform: `translate(-114px, -314px) scale(1.3)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('front/Right Leg', style({
      transform: `translate(-25px, -314px) scale(1.3)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('front/Left Arm', style({
      transform: `translate(-208px, -28px) scale(1.39)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('front/Right Arm', style({
      transform: `translate(48px, -28px) scale(1.39)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('front/Mouth', style({
      transform: `translate(-316px, 96px) scale(3)`,
      height: '700px',
      width: '1635px',
      opacity: 0,
    })),
    state('front/Chest', style({
      transform: `translate(-316px, 96px) scale(3)`,
      height: '700px',
      width: '1635px',
      opacity: 0,
    })),
    state('front/Abdomen', style({
      transform: `translate(-95px, -35px) scale(1.465)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('front/Head', style({
      transform: `translate(-316px, 96px) scale(3)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('back/Right Leg', style({
      transform: `translate(-114px, -314px) scale(1.3)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('back/Right Leg', style({
      transform: `translate(-114px, -314px) scale(1.3)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('back/Left Leg', style({
      transform: `translate(-25px, -314px) scale(1.3)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('back/Right Arm', style({
      transform: `translate(-279px, -50px) scale(1.5)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('back/Left Arm', style({
      transform: `translate(63px, -50px) scale(1.5)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('back/Head', style({
      transform: `translate(-327px, 96px) scale(2.9)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('back/Right Leg', style({
      transform: `translate(-114px, -314px) scale(1.3)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('side/Left Leg', style({
      transform: `translate(-56px, -316px) scale(1.3)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('side/Left Arm', style({
      transform: `translate(-51px, 78px) scale(1.2)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('side/Abdomen', style({
      transform: `translate(-95px, -50px) scale(1.5)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('side/Head', style({
      transform: `translate(-198px, 153px) scale(2)`,
      height: '700px',
      width: '1635px',
      opacity: 1,
    })),
    state('side/Mouth', style({
      transform: `translate(-316px, 96px) scale(3)`,
      height: '700px',
      width: '1635px',
      opacity: 0,
    })),
    state('side/Chest', style({
      transform: `translate(-316px, 96px) scale(3)`,
      height: '700px',
      width: '1635px',
      opacity: 0,
    })),
    transition(':enter', animate(0)),
    transition(':leave', animate(0)),
    transition('left => centre', animate('600ms ease-out')),
    transition('left => right', animate('600ms ease-in')),
    transition('right => centre', animate('600ms ease-out')),
    transition('right => left', animate('600ms ease-in')),
    transition('centre => left', animate('600ms ease-in')),
    transition('centre => right', animate('600ms ease-in')),
    // transition("* => left", animate("600ms ease-in")),
    // transition("centre => *", animate("600ms ease-in")),
    transition('* => *', animate('600ms ease-out')) // last zoom levels
    ]
  );
