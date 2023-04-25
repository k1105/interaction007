import dynamic from "next/dynamic";
import p5Types from "p5";
import { MutableRefObject } from "react";
import { Hand } from "@tensorflow-models/hand-pose-detection";
import { getSmoothedHandpose } from "../lib/getSmoothedHandpose";
import { updateHandposeHistory } from "../lib/updateHandposeHistory";
import { Keypoint } from "@tensorflow-models/hand-pose-detection";
import { shapeHandpose } from "../lib/shapeHandpose";

type Props = {
  handpose: MutableRefObject<Hand[]>;
};

type Handpose = Keypoint[];
type Handposes = {
  left: Handpose;
  right: Handpose;
};

const Sketch = dynamic(import("react-p5"), {
  loading: () => <></>,
  ssr: false,
});

export const HandSketch = ({ handpose }: Props) => {
  let handposeHistory: {
    left: Handpose[];
    right: Handpose[];
  } = { left: [], right: [] };

  const preload = (p5: p5Types) => {
    // 画像などのロードを行う
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.stroke(220);
    p5.fill(255);
    p5.strokeWeight(10);
  };

  const draw = (p5: p5Types) => {
    const rawHands: Handposes = shapeHandpose(handpose.current); //平滑化されていない手指の動きを使用する
    handposeHistory = updateHandposeHistory(rawHands, handposeHistory); //handposeHistoryの更新
    const hands: Handposes = getSmoothedHandpose(rawHands, handposeHistory); //平滑化された手指の動きを取得する

    p5.background(1, 25, 96);

    if (hands.left.length > 0) {
      const hand = hands.left;
      p5.push();
      p5.translate(p5.width / 2 - 300, p5.height / 2 + 50);
      p5.strokeJoin(p5.ROUND);
      p5.noFill();
      p5.beginShape();
      for (let i = 1; i <= 3; i++) {
        for (let j = i + 1; j <= 4; j++) {
          for (let k = j + 1; k <= 5; k++) {
            p5.vertex(hand[i * 4].x - hand[0].x, hand[i * 4].y - hand[0].y);
            p5.vertex(hand[j * 4].x - hand[0].x, hand[j * 4].y - hand[0].y);
            p5.vertex(hand[k * 4].x - hand[0].x, hand[k * 4].y - hand[0].y);
          }
        }
      }
      p5.endShape();
      p5.pop();
    }

    if (hands.right.length > 0) {
      const hand = hands.right;
      p5.push();
      p5.translate(p5.width / 2 + 300, p5.height / 2 + 50);
      p5.strokeJoin(p5.ROUND);
      p5.noFill();
      p5.beginShape();
      for (let i = 1; i <= 3; i++) {
        for (let j = i + 1; j <= 4; j++) {
          for (let k = j + 1; k <= 5; k++) {
            p5.vertex(hand[i * 4].x - hand[0].x, hand[i * 4].y - hand[0].y);
            p5.vertex(hand[j * 4].x - hand[0].x, hand[j * 4].y - hand[0].y);
            p5.vertex(hand[k * 4].x - hand[0].x, hand[k * 4].y - hand[0].y);
          }
        }
      }
      p5.endShape();
      p5.pop();
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <>
      <Sketch
        preload={preload}
        setup={setup}
        draw={draw}
        windowResized={windowResized}
      />
    </>
  );
};
