const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStorage() {
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) return console.error('Buckets Error:', bError);
  console.log('Buckets:', buckets.map(b => `${b.name} (public: ${b.public})`));

  for (const bucket of buckets) {
    const { data: files, error: fError } = await supabase.storage.from(bucket.name).list('', { limit: 10 });
    if (fError) console.error(`Files in ${bucket.name} Error:`, fError);
    else console.log(`Files in ${bucket.name}:`, files.map(f => f.name));
  }
}
checkStorage();
