<template>
  <div>
    <div class="num-inputs">
      <div v-for="(value, i) in input" :key="i" class="input-box-div">
        <label>{{ i + 1 }}º número</label>
        <input v-model="input[i]" type="number" class="input-box" />
      </div>
      <div class="input-box-div">
        <label>Constante (opcional)</label>
        <input v-model="n3" type="number" class="input-box" />
      </div>
    </div>
    <button @click="calculate" class="calculate-btn">Calculate</button>
    <katex-element
      v-for="(expression, i) in expressions"
      :key="i"
      :expression="expression"
      displayMode
    />
  </div>
</template>

<script>
import KatexElement from './KatexElement.vue';

export default {
  data() {
    return {
      expressions: [],
      input: [0, 0],
      n3: 0,
    };
  },

  components: { KatexElement },

  methods: {
    numberSignal(n) {
      return n < 0 ? '' : '+';
    },

    calculate() {
      this.expressions = [];
      const inputAbs = this.input.map(Math.abs);
      let swapped = false;
      if (inputAbs[0] < inputAbs[1]) swapped = true;

      const remainder = [Math.max(...inputAbs), Math.min(...inputAbs)];
      const quotients = [null];

      while (remainder[remainder.length - 1] != 0) {
        const [a, b] = remainder.slice(-2);
        remainder.push(a % b);
        quotients.push(Math.floor(a / b));
      }

      const coefX = [1, 0];
      const coefY = [0, 1];

      for (let i = 2; i < quotients.length; ++i) {
        coefX[i] = coefX[i - 2] - quotients[i - 1] * coefX[i - 1];
        coefY[i] = coefY[i - 2] - quotients[i - 1] * coefY[i - 1];
      }

      const [n1, n2] = swapped ? [...this.input].reverse() : this.input;
      const n3 = parseInt(this.n3, 10);

      if (!isNaN(n3)) this.expressions.push(`${n1}x ${this.numberSignal(n2)} ${n2}y = ${n3}`);

      this.expressions.push(`\\begin{array}{l | l | l | l}
      n & q_i & x_i & y_i\\\\
      \\hline
      ${remainder
        .map((v, i) => `${v} & ${quotients[i] ?? '-'} & ${coefX[i] ?? '-'} & ${coefY[i] ?? '-'}`)
        .join(`\\\\`)}
      \\end{array}
      `);

      if (!isNaN(n3)) {
        const gcd = remainder.slice(-2)[0];
        let c = gcd;
        let xi = coefX.slice(-1)[0];
        let yi = coefY.slice(-1)[0];
        let a = remainder[0];
        let b = remainder[1];
        const getEq = (gcd, n1, x, n2, y) =>
          `${gcd} = ${n1} \\times (${x}) ${this.numberSignal(n2)} ${n2} \\times (${y})`;

        if (n3 % gcd != 0) {
          this.expressions.push(
            `${gcd} \\text{ não divide } ${n3}\\text{, logo não dá para resolver eq. diofantina}`
          );
          return;
        }

        this.expressions.push(getEq(gcd, a, xi, b, yi));

        let multiplier = n3 / gcd;

        c *= multiplier;
        xi *= multiplier;
        yi *= multiplier;

        if (multiplier != 1) this.expressions.push(getEq(c, a, xi, b, yi));

        if (n1 != a) (a *= -1), (xi *= -1);
        if (n2 != b) (b *= -1), (yi *= -1);

        if (a < 0 || b < 0) this.expressions.push(getEq(c, a, xi, b, yi));

        this.expressions.push(`\\begin{cases}
          x = ${xi} ${this.numberSignal(b)} ${b / gcd}t\\\\
          y = ${yi} ${this.numberSignal(-a)} ${-a / gcd}t
        \\end{cases}
        \\quad, \\quad t\\in \\Z
        `);
      }
    },
  },
};
</script>

<style scoped>
.input-box {
  background: var(--bgColor);
  border: 1px solid var(--darken10BorderColor);
  color: var(--textColor);
}
.input-box-div {
  display: flex;
  flex-direction: column;
  margin-right: 5px;
}
.num-inputs {
  display: flex;
  margin-bottom: 8px;
}
.calculate-btn {
  background-color: #00aef8;
  color: rgba(0, 0, 0, 0.87);
  border: none;
  cursor: pointer;
  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%),
    0px 1px 5px 0px rgb(0 0 0 / 12%);
  padding: 6px 16px;
  border-radius: 4px;
  text-transform: uppercase;
  margin: 16px 8px;
}
</style>
