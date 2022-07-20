const formDefault = {
  key: '',
  answer: '',
  scoreWeight: 0
}

new Vue({
  el: '#app',
  data: {
    form: formDefault,
  },
  created() {
    if (window.addEventListener) {
      // For standards-compliant web browsers
      window.addEventListener('message', this.getParams, false);
    } else {
      window.attachEvent('onmessage', this.getParams);
    }
  },
  mounted() {
    window.parent.postMessage({
      mceAction: 'fill-in-the-blank-mounted',
      status: true,
    }, '*');
  },
  watch: {
    form: {
      handler: function (v) {
        this.sendAnswerData();
      },
      deep: true
    }
  },
  methods: {
    getParams(evt) {
      let data = evt.data;
      this.form.key = data.key;
      this.form.answer = data.answer;
      this.form.scoreWeight = data.scoreWeight;
    },
    sendAnswerData() {
      this.form.scoreWeight = parseInt(this.form.scoreWeight);
      window.parent.postMessage({
        mceAction: 'fill-in-the-blank-update',
        key: this.form.key,
        answer: this.form.answer,
        scoreWeight: this.form.scoreWeight,
      }, '*');
    }
  },
});
