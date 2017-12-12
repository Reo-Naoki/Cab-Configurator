export default {
  props: {
    color: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: 'img',
    },
  },
  data() {
    return {
      is404: false,
      colorBaseURL: '/resources/colors',
    };
  },
  methods: {
    emit404() {
      this.$emit('404');
    },
  },
  watch: {
    color() {
      // reset 404 status if color changed
      this.is404 = false;
    },
  },
};
