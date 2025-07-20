import mongoose, {Schema} from 'mongoose';
import mongooseAggregationPaginate from 'mongoose-aggregation-paginate-v2';
const commentScheema= new Schema({
    content:{
            type:String,
            required:true
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:'Video',
        required:true
    },
    owner:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
    },
},
 {timestamps:true}
);

commentScheema.plugin(mongooseAggregationPaginate);
export const Comment = mongoose.model('Comment',commentScheema);