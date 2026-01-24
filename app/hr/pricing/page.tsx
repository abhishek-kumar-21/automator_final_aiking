import FAQSection from '@/components/home/FAQSection'
import JobSeeker from '@/components/hr/jobseeker'
import PricingSection from '@/components/hr/pricing'
import React from 'react'

const page = () => {
  return (
    <>
        <PricingSection/>
        <FAQSection/>
        <JobSeeker/>
    </>
  )
}

export default page
